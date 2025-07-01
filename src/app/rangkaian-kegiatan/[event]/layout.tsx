export const metadata = {
  title: "Rangkaian Kegiatan",
  description: "Daftar rangkaian kegiatan pada Pasanggiri Mojang Jajaka oleh Paguyuban Mojang Jajaka Kabupaten Garut.",
}

export default function RKLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
    </>
  )
}