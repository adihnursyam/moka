import { eq } from "drizzle-orm";

import { permissions, rolePermissions, roles } from "@/server/db/schema";
import type { Database } from "@/server/db/queries";

import { permissionCatalog, roleTemplates } from "./permissions";

export async function seedAuthorizationCatalog(db: Database) {
  const now = new Date();
  for (const [key, label] of Object.entries(permissionCatalog)) {
    await db.insert(permissions).values({ key, label, description: label, createdAt: now, updatedAt: now })
      .onConflictDoUpdate({ target: permissions.key, set: { label, description: label, updatedAt: now } });
  }

  for (const [slug, template] of Object.entries(roleTemplates)) {
    const existing = await db.query.roles.findFirst({ where: eq(roles.slug, slug) });
    const roleId = existing?.id ?? crypto.randomUUID();
    await db.insert(roles).values({ id: roleId, slug, label: template.label, description: template.label, isSystem: true, createdAt: now, updatedAt: now })
      .onConflictDoUpdate({ target: roles.slug, set: { label: template.label, description: template.label, updatedAt: now } });
    const role = existing ?? { id: roleId };
    for (const permissionKey of template.permissions) {
      await db.insert(rolePermissions).values({ roleId: role.id, permissionKey, createdAt: now, updatedAt: now })
        .onConflictDoNothing();
    }
  }
}
