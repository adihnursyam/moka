"use client"

import Image from 'next/image';
import { useMediaQuery } from 'usehooks-ts';

// Define the props interface for type safety
interface ImageMaskFadeProps {
  src: string;
  alt: string;
  width?: number; // Optional as next/image can use 'fill'
  height?: number; // Optional as next/image can use 'fill'
  fill?: boolean; // next/image 'fill' prop
  className?: string; // Tailwind CSS classes for the container div
  blurDataURL?: string; // Data URL for the blur effect
  imgClassName?: string; // Tailwind CSS classes for the Image component itself
  // You can add more props here if needed, like 'priority', 'sizes', etc.
  // from next/image, but ensure they are correctly typed.
}

const ImageMaskFade: React.FC<ImageMaskFadeProps> = ({
  src,
  alt,
  width,
  height,
  fill,
  className,
  imgClassName,
  ...props // Capture any additional props passed to next/image
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Construct the mask-image style dynamically
  // For 'to left': opacity 100% on the right (0% of gradient) to 0% on the left (100% of gradient)
  const maskStyle: React.CSSProperties = isMobile ? {
    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%)',
    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%)',
  }  : {
    maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%)',
    WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%)',
  };

  return (
    <div className={`relative ${className || ''} z-0`}>
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width} // Only pass width/height if `fill` is not true
        height={fill ? undefined : height}
        fill={fill} // Pass the fill prop directly
        style={maskStyle}
        // Tailwind classes can be added here for other styling (e.g., rounded corners)
        // Ensure that the image itself doesn't overflow if the container has rounded corners
        className={`block ${imgClassName || ''}`}
        {...props} // Spread any other standard Image props like `priority`, `sizes`
      />
    </div>
  );
};

export default ImageMaskFade;
