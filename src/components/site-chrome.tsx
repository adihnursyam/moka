"use client";

import { usePathname } from "next/navigation";

type SiteChromeProps = {
  children: React.ReactNode;
  top?: React.ReactNode;
  bottom?: React.ReactNode;
};

/**
 * Keeps the public presentation layer out of the CMS and monitor surfaces.
 * The root layout still owns the shared shell, while each product surface can
 * keep its own navigation and density.
 */
export function SiteChrome({ children, top, bottom }: SiteChromeProps) {
  const pathname = usePathname();
  const isPrivateSurface = pathname?.startsWith("/admin") || pathname?.startsWith("/monitor");

  return (
    <>
      {!isPrivateSurface && top}
      {children}
      {!isPrivateSurface && bottom}
    </>
  );
}
