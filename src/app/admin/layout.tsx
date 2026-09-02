import { headers } from "next/headers";
import { auth } from "@/server/auth/config";
import { getEffectivePermissions } from "@/server/auth/authorization";
import { AdminShell, type AdminNavItem } from "@/components/admin/admin-shell";
import { desc, eq } from "drizzle-orm";
import { database } from "@/server/db/client";
import { editions } from "@/server/db/schema";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const permissions = session?.user ? await getEffectivePermissions(session.user.id) : new Set<string>();
  if (!session?.user || !permissions.has("admin.view")) return children;
  const [activeEdition] = await database.select({ name: editions.name, year: editions.year }).from(editions).where(eq(editions.lifecycle, "active")).orderBy(desc(editions.year)).limit(1);
  const links: (AdminNavItem & { permission: string })[] = [
    { href: "/admin", label: "Dashboard", icon: "layout", group: "Ringkasan", exact: true, permission: "admin.view" },
    { href: "/admin/content", label: "Konten", icon: "file", group: "Studio", exact: false, permission: "content.view" },
    { href: "/admin/media", label: "Media library", icon: "images", group: "Studio", exact: true, permission: "media.view" },
    { href: "/admin/voting", label: "Voting", icon: "bar-chart", group: "Operasional", exact: true, permission: "voting.view" },
    { href: "/admin/users", label: "Pengguna", icon: "users", group: "Operasional", exact: true, permission: "users.view" },
    { href: "/admin/audit", label: "Audit log", icon: "clock", group: "Operasional", exact: true, permission: "audit.view" },
    { href: "/admin/profile", label: "Profil", icon: "settings", group: "Akun", exact: true, permission: "admin.view" },
  ];
  return (
    <AdminShell
      links={links.filter(({ permission }) => permissions.has(permission))}
      user={{ name: session.user.name, email: session.user.email }}
      edition={activeEdition ?? null}
    >
      {children}
    </AdminShell>
  );
}
