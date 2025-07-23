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
