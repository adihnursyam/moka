"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/server/auth/authorization";
import { appendAuditLog } from "@/server/auth/audit";
import { database } from "@/server/db/client";
import { organizationAssignments, people } from "@/server/db/schema";

export async function createPersonAction(formData: FormData) {
  const actor = await requirePermission("people.manage");
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const title = String(formData.get("title") ?? "").trim();
  const group = String(formData.get("group") ?? "kepengurusan").trim();
  const editionId = String(formData.get("editionId") ?? "") || null;
  if (!name || !title || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Data pengurus tidak valid");
  const personId = crypto.randomUUID();
  const assignmentId = crypto.randomUUID();
  await database.transaction(async (tx) => {
    await tx.insert(people).values({ id: personId, name, slug, shortBio: String(formData.get("shortBio") ?? "").trim() || null });
    await tx.insert(organizationAssignments).values({ id: assignmentId, editionId, personId, title, group });
    await appendAuditLog(tx, { actorUserId: actor.session.user.id, actorLabel: actor.session.user.email, action: "person.create", resourceType: "person", resourceId: personId, resourceLabel: name, after: { name, slug, title, group, editionId }, changedFields: ["name", "slug", "title", "group", "editionId"], source: "admin-content" });
  });
  revalidatePath("/admin/content/people");
}
