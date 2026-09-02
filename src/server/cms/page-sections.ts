import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { database } from "@/server/db/client";
import { contentDrafts, contentRevisions, pageSections } from "@/server/db/schema";
import { appendAuditLog } from "@/server/auth/audit";
import { requirePermission } from "@/server/auth/authorization";

const sectionPatchSchema = z.object({ title: z.string().max(200).nullable().optional(), eyebrow: z.string().max(120).nullable().optional(), body: z.string().max(20_000).nullable().optional() }).strict();

export async function savePageSectionDraft(resourceId: string, baseVersion: number, patch: unknown) {
  const actor = await requirePermission("content.edit");
  const candidate = sectionPatchSchema.parse(patch);
  const current = await database.query.pageSections.findFirst({ where: eq(pageSections.id, resourceId) });
  if (!current || current.version !== baseVersion) throw new Error("Content version conflict");
  await database.transaction(async (tx) => {
    await tx.insert(contentDrafts).values({ resourceType: "pageSection", resourceId, baseVersion, snapshotJson: JSON.stringify({ ...current, ...candidate }), authorUserId: actor.session.user.id })
      .onConflictDoUpdate({ target: [contentDrafts.resourceType, contentDrafts.resourceId], set: { baseVersion, snapshotJson: JSON.stringify({ ...current, ...candidate }), authorUserId: actor.session.user.id, updatedAt: new Date() } });
    await appendAuditLog(tx, { actorUserId: actor.session.user.id, actorLabel: actor.session.user.email, action: "content.draft.save", resourceType: "pageSection", resourceId, before: current, after: candidate, changedFields: Object.keys(candidate), source: "admin-content" });
  });
}

export async function publishPageSection(resourceId: string) {
  const actor = await requirePermission("content.publish");
  await database.transaction(async (tx) => {
    const current = await tx.query.pageSections.findFirst({ where: eq(pageSections.id, resourceId) });
    const draft = await tx.query.contentDrafts.findFirst({ where: and(eq(contentDrafts.resourceType, "pageSection"), eq(contentDrafts.resourceId, resourceId)) });
    if (!current || !draft || current.version !== draft.baseVersion) throw new Error("Draft is stale or missing");
    const snapshot = JSON.parse(draft.snapshotJson) as typeof current;
    const nextVersion = current.version + 1;
    await tx.update(pageSections).set({ title: snapshot.title, eyebrow: snapshot.eyebrow, body: snapshot.body, status: "published", version: nextVersion, updatedAt: new Date() }).where(eq(pageSections.id, resourceId));
    await tx.insert(contentRevisions).values({ resourceType: "pageSection", resourceId, version: nextVersion, snapshotJson: draft.snapshotJson, authorUserId: actor.session.user.id });
    await tx.delete(contentDrafts).where(eq(contentDrafts.id, draft.id));
    await appendAuditLog(tx, { actorUserId: actor.session.user.id, actorLabel: actor.session.user.email, action: "content.publish", resourceType: "pageSection", resourceId, before: current, after: snapshot, changedFields: ["title","eyebrow","body","status","version"], source: "admin-content" });
  });
}
