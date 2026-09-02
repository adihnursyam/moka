import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { database } from "@/server/db/client";
import { adminProfiles, rolePermissions, roles, userPermissionOverrides, userRoles } from "@/server/db/schema";

import { auth } from "./config";
import { permissionKeys, type PermissionKey } from "./permissions";

export class AuthorizationError extends Error {
  constructor(public readonly status: 401 | 403, message: string) {
    super(message);
  }
}

export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new AuthorizationError(401, "Authentication required");
  return session;
}

export async function getEffectivePermissions(userId: string) {
  const profile = await database.query.adminProfiles.findFirst({
    where: eq(adminProfiles.userId, userId),
  });
  if (!profile || profile.status !== "active") return new Set<PermissionKey>();

  const roleRows = await database
    .select({ slug: roles.slug, permissionKey: rolePermissions.permissionKey })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .innerJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
    .where(eq(userRoles.userId, userId));
  const roleSlugs = new Set(roleRows.map((row) => row.slug));
  if (roleSlugs.has("super_admin")) return new Set(permissionKeys);

  const effective = new Set<PermissionKey>(roleRows.map((row) => row.permissionKey as PermissionKey));
  const overrides = await database.query.userPermissionOverrides.findMany({
    where: eq(userPermissionOverrides.userId, userId),
  });
  for (const override of overrides) {
    if (override.effect === "deny") effective.delete(override.permissionKey as PermissionKey);
    else effective.add(override.permissionKey as PermissionKey);
  }
  return effective;
}

export async function requirePermission(permission: PermissionKey) {
  const session = await requireSession();
  const effectivePermissions = await getEffectivePermissions(session.user.id);
  if (!effectivePermissions.has(permission)) {
    throw new AuthorizationError(403, "Permission denied");
  }
  return { session, effectivePermissions };
}

export async function requireAdmin() {
  return requirePermission("admin.view");
}

export async function ensurePendingAdminProfile(userId: string) {
  await database.insert(adminProfiles).values({ userId, status: "pending", lastSignedInAt: new Date() })
    .onConflictDoUpdate({ target: adminProfiles.userId, set: { lastSignedInAt: new Date(), updatedAt: new Date() } });
}

export async function requireRoleAdministrator() {
  const { session, effectivePermissions } = await requirePermission("access.approve");
  const hasManage = effectivePermissions.has("access.manage");
  if (!hasManage) throw new AuthorizationError(403, "Role Administrator permission required");
  return { session, effectivePermissions };
}

export async function validatePermissionKeys(keys: readonly string[]) {
  if (keys.some((key) => !permissionKeys.includes(key as PermissionKey))) {
    throw new Error("Unknown permission key");
  }
  return keys as PermissionKey[];
}
