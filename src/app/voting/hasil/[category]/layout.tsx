export const metadata = {
  title: "Hasil Voting",
  description: "Hasil STAR Voting untuk Pasanggiri Mojang Jajaka Kabupaten Garut 2025",
}

export default function HasilLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
    </>
  );
}