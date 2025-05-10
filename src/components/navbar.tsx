"use client";

import Link from 'next/link';
import { useState, useEffect, useRef, RefObject } from 'react';
import Image from 'next/image';
import { useMediaQuery, useOnClickOutside } from 'usehooks-ts';
import { Button } from './custom/button'; // Assuming this path is correct
import { motion } from 'framer-motion'; // Import motion
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from '@/components/ui/accordion';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/pasanggiri', label: 'Pasanggiri' },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

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
          className="flex fixed max-sm:hidden w-[calc(100vw-4rem)] items-center justify-between px-8 py-4 shadow-md rounded-full mx-8 mt-2 bg-white/20 backdrop-blur-sm h-20 z-[999]" // Ensure z-index is high
          initial={{ y: 0 }}
          animate={{ y: isNavbarVisible ? 0 : '-120%' }} // Slide up more than 100% to be fully hidden
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <Link href='/' className='h-full'>
            <Image src='/logo-orange.png' alt='logo' width={100} height={60} className='h-full w-auto object-contain' />
          </Link>
          <div className="flex gap-8 font-montserrat">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="font-medium text-fb hover:text-fb-500 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Button>Register</Button>
        </motion.nav>
      )}

      {/* Mobile Navbar Placeholder (Your existing logic for mobile can go here) */}
      {isMobile && (
        <nav className="fixed top-0 w-full z-[999] bg-white/20 backdrop-blur-md shadow-md md:hidden">
          {/* Example Mobile Structure */}
          <div className="w-full p-4 px-8 flex items-center justify-between h-16">
            <Link href='/' className='h-full'>
              <Image src='/logo-orange.png' alt='logo' width={80} height={40} className='h-full w-auto object-contain' />
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
            <AccordionItem value='root-navbar' ref={ref}>
              <AccordionContent className='text-white px-8'>
                <div className={`flex flex-col gap-4 mt-8`}>
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="font-medium text-fb hover:text-fb-500 transition-all"
                      onClick={() => setIsMobileMenuOpen(false)} // Close menu on link click
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    href='/register'
                    className="w-full text-fb rounded-md font-semibold"
                    onClick={() => setIsMobileMenuOpen(false)} // Close menu on link click
                  >
                    Register
                  </Link>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </nav>
      )}
    </>
  );
}