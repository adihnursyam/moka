import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from '@/components/navbar';
import Footer from '@/components/footer';
import { inter, montserrat } from '@/style/font';
import { ScrollToTopButton } from '@/components/scroll-to-top';
import Lenis from '@/components/lenis';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: {
    default: "PAMOKA Garut",
    template: "%s | MOKA Garut",
  },
  description: "Official website Paguyuban Mojang Jajaka Kabupaten Garut",
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
        <Toaster />
        <Footer />
      </body>
    </html>
  );
}
