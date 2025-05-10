import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from '@/components/navbar';
import Footer from '@/components/footer';
import { inter, montserrat } from '@/style/font';
import { ScrollToTopButton } from '@/components/scroll-to-top';
import Lenis from '@/components/lenis';

export const metadata: Metadata = {
  title: "PAMOKA Garut",
  description: "Official website of Paguyuban Mojang Jajaka Kabupaten Garut",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} ${inter.variable} antialiased font-inter`}
      >
        <Navbar />
        <Lenis />
        {children}
        <ScrollToTopButton />
        <Footer />
      </body>
    </html>
  );
}
