import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from '@/components/navbar';
import Footer from '@/components/footer';
import { inter, montserrat } from '@/style/font';
import { ScrollToTopButton } from '@/components/scroll-to-top';
import Lenis from '@/components/lenis';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';
import { Toaster } from '@/components/ui/sonner';
import Script from "next/script";
import { SiteChrome } from '@/components/site-chrome';
import { categories, rangkaianKegiatan } from '@/lib/data';

export const metadata: Metadata = {
  title: {
    default: "PAMOKA Garut",
    template: "%s | MOKA Garut",
  },
  description: "Official website Paguyuban Mojang Jajaka Kabupaten Garut",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      {/* Google Analytics Tag */}
      <Script
        async
        strategy='afterInteractive'
        src="https://www.googletagmanager.com/gtag/js?id=G-SW6MQS7GD4"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SW6MQS7GD4');
          `,
        }}
      />
      <body
        className={`${montserrat.variable} ${inter.variable} antialiased font-inter`}
      >
        <SiteChrome
          top={
            <>
              <Navbar categories={categories} events={rangkaianKegiatan.map((item) => ({ label: item.label, slug: item.label.toLowerCase().replace(/\s+/g, '-') }))} />
              <Lenis />
            </>
          }
          bottom={
            <>
              <ScrollToTopButton />
              <Footer />
            </>
          }
        >
          {children}
        </SiteChrome>
        <Toaster />
      </body>
    </html>
  );
}
