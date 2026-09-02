import { and, eq } from "drizzle-orm";

import { accessRequests, adminProfiles, roles, userRoles } from "@/server/db/schema";
import { database } from "@/server/db/client";

import { appendAuditLog } from "./audit";
import { requireRoleAdministrator, requireSession } from "./authorization";

export async function submitAccessRequest(reason: string, requestedAreas: string[]) {
  const session = await requireSession();
  const trimmedReason = reason.trim();
  if (trimmedReason.length < 10 || trimmedReason.length > 500) {
    throw new Error("Reason must be between 10 and 500 characters");
  }

  await database.transaction(async (tx) => {
    const existing = await tx.query.accessRequests.findFirst({
      where: and(eq(accessRequests.userId, session.user.id), eq(accessRequests.status, "open")),
    });
    if (existing) throw new Error("An access request is already open");

    const profile = await tx.query.adminProfiles.findFirst({ where: eq(adminProfiles.userId, session.user.id) });
    if (!profile || profile.status !== "pending") throw new Error("This account cannot request access in its current status");

    const requestId = crypto.randomUUID();
    await tx.insert(accessRequests).values({
      id: requestId,
      userId: session.user.id,
      reason: trimmedReason,
      requestedAreasJson: JSON.stringify(requestedAreas.slice(0, 12)),
    });
    await tx.update(adminProfiles).set({ requestedAt: new Date(), updatedAt: new Date() }).where(eq(adminProfiles.userId, session.user.id));
    await appendAuditLog(tx, {
      actorUserId: session.user.id,
      actorLabel: session.user.email,
      action: "access.request.create",
      resourceType: "accessRequest",
      resourceId: requestId,
      resourceLabel: session.user.email,
      after: { status: "open", requestedAreas },
      changedFields: ["reason", "requestedAreas", "status"],
      source: "admin-request-access",
      reason: trimmedReason,
    });
  });
}

export async function approveAccessRequest(requestId: string, roleSlug: string, note?: string) {
  const reviewer = await requireRoleAdministrator();
  if (roleSlug === "super_admin") throw new Error("Super admin can only be assigned through the manual Turso runbook");

  await database.transaction(async (tx) => {
    const request = await tx.query.accessRequests.findFirst({ where: eq(accessRequests.id, requestId) });
    if (!request || request.status !== "open") throw new Error("Open access request not found");
    const role = await tx.query.roles.findFirst({ where: eq(roles.slug, roleSlug) });
    if (!role || role.slug === "super_admin") throw new Error("Requested role is not assignable");

    await tx.insert(userRoles).values({ userId: request.userId, roleId: role.id, grantedByUserId: reviewer.session.user.id, grantedAt: new Date() })
      .onConflictDoNothing();
    await tx.update(adminProfiles).set({ status: "active", statusReason: note?.trim() || null, updatedAt: new Date() })
      .where(eq(adminProfiles.userId, request.userId));
    await tx.update(accessRequests).set({ status: "approved", reviewedByUserId: reviewer.session.user.id, reviewNote: note?.trim() || null, reviewedAt: new Date(), updatedAt: new Date() })
      .where(eq(accessRequests.id, requestId));
    await appendAuditLog(tx, {
      actorUserId: reviewer.session.user.id,
      actorLabel: reviewer.session.user.email,
      action: "access.request.approve",
      resourceType: "accessRequest",
      resourceId: requestId,
      resourceLabel: request.userId,
      before: { status: "open" },
      after: { status: "approved", role: role.slug, profileStatus: "active" },
      changedFields: ["status", "role", "profileStatus"],
      source: "admin-users",
      reason: note?.trim() || null,
    });
  });
}
