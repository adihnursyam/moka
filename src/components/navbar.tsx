"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, RefObject, ReactNode } from 'react';
import Image from 'next/image';
import { useMediaQuery, useOnClickOutside } from 'usehooks-ts';
import { motion } from 'motion/react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { categories, rangkaianKegiatan } from '@/lib/data';

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  // Set the exact cutoff time in ISO 8601 format with the GMT+7 offset
  const votingEndTime = new Date('2025-07-11T23:59:59+07:00');
  const now = new Date();
  const isVotingActive = now < votingEndTime;

  const navLinks: { href: string, label: string, isPopover?: boolean, content?: ReactNode, accordion?: ReactNode, ending?: boolean }[] = [
    { href: '/', label: 'Beranda' },
    { href: '/tentang', label: 'Tentang' },
    // { href: '/kontak', label: 'Kontak Kami' },
    { href: 'rangkaian-kegiatan', label: 'Rangkaian Kegiatan', isPopover: true, content: <RangkaianKegiatanPopover />, accordion: <RangkaianKegiatanAccordion setIsMobileMenuOpen={setIsMobileMenuOpen} /> },
    { href: 'voting', label: 'Voting', isPopover: true, content: <VotingPopover />, accordion: <VotingAccordion setIsMobileMenuOpen={setIsMobileMenuOpen} />, ending: !isVotingActive },
  ];

  // State for navbar visibility on scroll (desktop)
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const lastScrollY = useRef(0); // Using useRef to persist lastScrollY across renders without causing re-renders
  const navbarHeightThreshold = 80; // Roughly the height of your navbar

  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref as RefObject<HTMLDivElement>, () => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  })

  useEffect(() => {
    if (isMobile) {
      setIsNavbarVisible(true); // Always visible on mobile for this logic
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= navbarHeightThreshold) { // Always show if near top
        setIsNavbarVisible(true);
      } else if (currentScrollY > lastScrollY.current) { // Scrolling down
        setIsNavbarVisible(false);
      } else { // Scrolling up
        setIsNavbarVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]); // Re-run if isMobile changes

  return (
    <>
      {/* Desktop Navbar */}
      {!isMobile && (
        <motion.nav
          key={pathname + "-navbar"} // Ensure it re-renders on route change
          className="flex fixed max-sm:hidden w-[calc(100vw-4rem)] items-center justify-between px-8 py-4 shadow-md rounded-full mx-8 mt-2 bg-white/20 backdrop-blur-sm h-20 z-[999]" // Ensure z-index is high
          initial={{ y: 0 }}
          animate={{ y: isNavbarVisible ? 0 : '-120%' }} // Slide up more than 100% to be fully hidden
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <Link href='/' className='h-full'>
            <Image src='/logo-orange.png' alt='logo' width={100} height={60} className='h-full w-auto object-contain' priority />
          </Link>
          <div className="flex gap-8 font-montserrat">
            {navLinks.map((link) => link.ending ? (<></>) : link.isPopover ? (
              <Popover key={link.label}>
                <PopoverTrigger className='font-medium capitalize text-fb hover:text-fb-500 transition-all'>{link.label}</PopoverTrigger>
                {link.content || <VotingPopover />}
              </Popover>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="font-medium text-fb hover:text-fb-500 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Popover>
            <PopoverTrigger className='font-medium capitalize text-fb hover:text-fb-500 transition-all border border-fb py-1.5 px-3 rounded-md'>Hasil Voting</PopoverTrigger>
            <PopoverContent sideOffset={24} className='z-[1000] bg-white/20 backdrop-blur-sm grid w-[400px] gap-3 p-4 md:w-[400px] md:grid-cols-2 lg:w-[400px] text-white border-0'>
              {categories.map((category) => (
                <Link
                  key={category.slug + "-navbar-popover"}
                  href={`/voting/hasil/${category.slug}`}
                  className="px-4 py-2 rounded-lg transition-all hover:bg-white/10 border border-fb text-center"
                >
                  <div className="">{category.name}</div>
                </Link>
              ))}
            </PopoverContent>
          </Popover>
        </motion.nav>
      )}

      {/* Mobile Navbar */}
      {isMobile && (
        <nav className="fixed top-0 w-full z-[999] bg-white/20 backdrop-blur-md shadow-md md:hidden" ref={ref} key={pathname + "-mobile-navbar"}>
          <div className="w-full p-4 px-8 flex items-center justify-between h-16">
            <Link href='/' className='h-full'>
              <Image src='/logo-orange.png' alt='logo' width={80} height={40} className='h-full w-auto object-contain' priority />
            </Link>
            <button
              className='md:hidden w-8 h-8 flex flex-col justify-center items-center z-[60]'
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <motion.span
                className='w-8 h-0.5 bg-linear-to-br to-90% from-dgb to-fb block absolute'
                animate={{
                  rotate: isMobileMenuOpen ? 45 : 0,
                  y: isMobileMenuOpen ? 0 : -8,
                  width: isMobileMenuOpen ? 24 : 24,
                }}
                transition={{ duration: 0.3 }}
              />
              <motion.span
                className='w-6 h-0.5 bg-fb block absolute'
                animate={{
                  opacity: isMobileMenuOpen ? 0 : 1,
                  x: isMobileMenuOpen ? 20 : 0,
                }}
                transition={{ duration: 0.3 }}
              />
              <motion.span
                className='w-4 h-0.5 bg-linear-to-tl to-90% from-fb to-dgb block absolute'
                animate={{
                  rotate: isMobileMenuOpen ? -45 : 0,
                  y: isMobileMenuOpen ? 0 : 8,
                  width: isMobileMenuOpen ? 24 : 16,
                }}
                transition={{ duration: 0.3 }}
              />
            </button>
          </div>
          <Accordion
            type='single'
            collapsible
            value={isMobileMenuOpen ? 'root-navbar' : ''}
            onValueChange={(value: string) => {
              setIsMobileMenuOpen(value === 'root-navbar');
            } // Close menu when not selected
            }
          >
            <AccordionItem value='root-navbar'>
              <AccordionContent className='text-white px-8'>
                <div className={`my-4 flex flex-col`}>
                  {navLinks.map((link) => link.ending ? (<></>) : link.isPopover ?
                    (<Accordion key={link.label} type='single' collapsible className='w-full'>
                      <AccordionItem value='voting' className='py-1.5'>
                        <AccordionTrigger className='font-medium text-fb hover:text-fb-500 transition-all p-0'>{link.label}</AccordionTrigger>
                        <AccordionContent className='pb-0 pt-1.5 *:*:py-1.5 *:px-4 w-full'>
                          {link.accordion || <VotingAccordion />}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    ) : (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="font-medium text-fb hover:text-fb-500 transition-all py-1.5"
                        onClick={() => setIsMobileMenuOpen(false)} // Close menu on link click
                      >
                        {link.label}
                      </Link>
                    ))}
                  <Accordion className='w-full' type='single' collapsible>
                    <AccordionItem value='hasil-voting'>
                      <AccordionTrigger className='font-medium text-fb hover:text-fb-500 transition-all py-1.5'>Hasil Voting</AccordionTrigger>
                      <AccordionContent className=''>
                        {categories.map((category) => (
                          <div className="*:py-1.5 px-4 w-full"
                            key={category.slug + "-navbar-accordion"}>
                            <Link
                              href={`/voting/hasil/${category.slug}`}
                              className="w-full flex"
                              onClick={() => setIsMobileMenuOpen(false)} // Close menu on link click
                            >
                              <div className="">{category.name}</div>
                            </Link>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </nav>
      )}
    </>
  );
}

function VotingPopover({ setIsMobileMenuOpen }: { setIsMobileMenuOpen?: (open: boolean) => void }) {
  return (
    <PopoverContent sideOffset={24} className='z-[1000] bg-white/20 backdrop-blur-sm grid w-[400px] gap-3 p-4 md:w-[400px] md:grid-cols-2 lg:w-[400px] text-white border-0'>
      {categories.map((category) => (
        <Link
          key={category.slug + "-navbar-popover"}
          href={`/voting/${category.slug}`}
          className="px-4 py-2 rounded-lg transition-all hover:bg-white/10 border border-fb text-center"
          onClick={() => {
            if (setIsMobileMenuOpen) {
              setIsMobileMenuOpen(false); // Close mobile menu if applicable
            }
          }
          }
        >
          <div className="">{category.name}</div>
        </Link>
      ))}
    </PopoverContent>
  );
}

function VotingAccordion(
  { setIsMobileMenuOpen }: { setIsMobileMenuOpen?: (open: boolean) => void }
) {
  return (
    <>
      <div className='w-full'>
        <Link href='/voting/mojang-rumaja' className="w-full flex"
          onClick={() => {
            if (setIsMobileMenuOpen) {
              setIsMobileMenuOpen(false);
            }
          }}
        >
          Mojang Rumaja
        </Link>
      </div>
      <div className='w-full'>
        <Link href='/voting/jajaka-rumaja' className="w-full flex"
          onClick={() => {
            if (setIsMobileMenuOpen) {
              setIsMobileMenuOpen(false);
            }
          }}
        >
          Jajaka Rumaja
        </Link>
      </div>
      <div className='w-full'>
        <Link href='/voting/mojang-dewasa' className="w-full flex"
          onClick={() => {
            if (setIsMobileMenuOpen) {
              setIsMobileMenuOpen(false);
            }
          }}
        >
          Mojang Dewasa
        </Link>
      </div>
      <div className='w-full'>
        <Link href='/voting/jajaka-dewasa' className="w-full flex"
          onClick={() => {
            if (setIsMobileMenuOpen) {
              setIsMobileMenuOpen(false);
            }
          }}
        >
          Jajaka Dewasa
        </Link>
      </div>
    </>
  )
}

function RangkaianKegiatanPopover({ setIsMobileMenuOpen }: { setIsMobileMenuOpen?: (open: boolean) => void }) {
  return (
    <PopoverContent sideOffset={24} className='z-[1000] bg-white/20 backdrop-blur-sm grid w-[400px] gap-3 p-4 md:w-[400px] md:grid-cols-2 lg:w-[400px] text-white border-0'>
      {rangkaianKegiatan.map((kegiatan, index) => (
        <Link
          key={index + "-navbar-popover"}
          href={`/rangkaian-kegiatan/${kegiatan.label.toLowerCase().replace(/\s+/g, '-')}`}
          className="px-4 py-2 rounded-lg transition-all hover:bg-white/10 border border-fb text-center"
          onClick={() => {
            if (setIsMobileMenuOpen) {
              setIsMobileMenuOpen(false);
            }
          }}
        >
          <div className="">{kegiatan.label}</div>
        </Link>
      ))}
    </PopoverContent>
  );
}

function RangkaianKegiatanAccordion({ setIsMobileMenuOpen }: { setIsMobileMenuOpen?: (open: boolean) => void }) {
  return (
    <>
      {rangkaianKegiatan.map((kegiatan, index) => (
        <div key={index + "-accordion"} className="w-full">
          <Link href={`/rangkaian-kegiatan/${kegiatan.label.toLowerCase().replace(/\s+/g, '-')}`} className="flex"
            onClick={() => {
              if (setIsMobileMenuOpen) {
                setIsMobileMenuOpen(false);
              }
            }}
          >
            {kegiatan.label}
          </Link>
        </div>
      ))}
    </>
  );
}