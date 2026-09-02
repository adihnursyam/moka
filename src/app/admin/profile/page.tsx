import { Mail, ShieldCheck, UserRound } from "lucide-react";
import Image from "next/image";

import { AdminBadge, AdminCard, AdminCardHeader, AdminPage } from "@/components/admin/primitives";
import { ensurePendingAdminProfile, getEffectivePermissions, requireSession } from "@/server/auth/authorization";

export default async function ProfilePage() {
  const session = await requireSession();
  await ensurePendingAdminProfile(session.user.id);
  const permissions = await getEffectivePermissions(session.user.id);
  return (
    <AdminPage eyebrow="Akun / profil" title="Profil admin" description="Identitas dan izin efektif yang sedang digunakan untuk ruang kerja ini.">
      <AdminCard className="max-w-3xl">
        <AdminCardHeader eyebrow="Identitas pengguna" title="Akun Anda" description="Informasi ini berasal dari akun Google yang digunakan saat masuk." />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-md bg-dgb text-xl font-semibold text-white">
            {session.user.image ? <Image className="h-full w-full object-cover" src={session.user.image} alt={`Foto ${session.user.name}`} width={80} height={80} /> : <UserRound size={30} />}
          </div>
          <div><h2 className="font-montserrat text-xl font-semibold text-dgb-900">{session.user.name}</h2><p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><Mail size={14} />{session.user.email}</p></div>
        </div>
        <div className="mt-7 border-t border-border pt-6">
          <div className="flex items-center gap-2"><ShieldCheck size={17} className="text-fb-600" /><h3 className="text-sm font-semibold text-dgb-900">Izin efektif</h3></div>
          <p className="mt-1 text-xs text-muted-foreground">Izin dihitung dari role dan override yang diberikan kepada akun ini.</p>
          <div className="mt-4 flex flex-wrap gap-2">{[...permissions].map((permission) => <AdminBadge value={permission} key={permission} />)}</div>
        </div>
      </AdminCard>
    </AdminPage>
  );
}
