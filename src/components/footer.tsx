import { Instagram, Twitter, Youtube } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Separator } from './ui/separator';

export default function Footer() {
  return (
    <footer className="w-full bg-linear-to-br from-dgb to-fb md:min-h-72 relative pb-2 text-white flex flex-col justify-between">
      <div className="flex max-sm:flex-col justify-between px-6 md:px-12 py-12 md:pt-16 gap-x-20 gap-y-8">
        <div className="space-y-8 md:w-1/2">
          <Image
            src="/logo-w.png"
            alt="Logo"
            width={1000}
            height={1000}
            className="w-3/4 h-auto object-cover"
          />
          <div className='flex gap-6 text-white'>
            <Link href="https://www.instagram.com/mokagarut/" target="_blank">
              <Instagram /></Link>
            <Link href="https://www.instagram.com/mokagarut/" target="_blank">
              <Youtube /></Link>
            <Link href="https://www.instagram.com/mokagarut/" target="_blank">
              <Twitter /></Link>
          </div>
        </div>

          <div className="w-1/2">
            <h4 className="font-bold mb-4">About Us</h4>
            <p className="text-sm text-white/80">PAMOKA Garut is a community of young people who are passionate about promoting the culture, tourism, and creative economy of Garut Regency.</p>
          </div>
          <div className="flex flex-col w-1/2 gap-2 *:font-semibold font-montserrat">
            <Link href="#section-1" className="text-sm text-white/80">Our Program</Link>
            <Link href="#section-2" className="text-sm text-white/80">News</Link>
            <Link href="#hero" className="text-sm text-white/80">Contact Us</Link>
            <Link href="/pasanggiri" className="text-sm text-white/80">Pasanggiri</Link>
          </div>
      </div>
      <div className="space-y-2 font-montserrat px-4">
        <Separator className="bg-white/70" />
        <p className="text-[12px] text-center">Copyright @ PAMOKA Garut 2025</p>
      </div>
    </footer>
  )
}