'use client';

import Image from 'next/image';
import { useMediaQuery } from 'usehooks-ts';

type ImageMaskFadeProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  imgClassName?: string;
};

export default function ImageMaskFade({ src, alt, width, height, fill, className, imgClassName, ...props }: ImageMaskFadeProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const maskStyle: React.CSSProperties = isMobile
    ? {
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%)',
      }
    : {
        maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%)',
        WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%)',
      };

  return (
    <div className={`relative z-0 ${className || ''}`}>
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        style={maskStyle}
        className={`block ${imgClassName || ''}`}
        {...props}
      />
    </div>
  );
}
