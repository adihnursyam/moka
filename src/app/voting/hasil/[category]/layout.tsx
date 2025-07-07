// export const metadata = {
//   title: "Hasil Voting",
//   description: "Hasil STAR Voting untuk Pasanggiri Mojang Jajaka Kabupaten Garut 2025",
// }

import { categories } from '@/lib/data';

export async function generateMetadata({ params }: Readonly<{ params: Promise<{ category: string }> }>) {
  const { category: catt } = await params;
  const category = categories.find(cat => cat.slug === catt);
  if (!category) {
    return {
      title: "Kategori Tidak Ditemukan",
      description: "Kategori yang Anda cari tidak ditemukan.",
    };
  }
  return {
    title: `Hasil Voting - ${category.name} 2025`,
    description: `Hasil STAR Voting untuk Pasanggiri Mojang Jajaka Kabupaten Garut 2025 pada kategori ${category.name}.`,
  };
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