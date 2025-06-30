import Image from 'next/image';

export default function BG({src}: {src?: string}) {
  return (
    <div className="fixed w-full h-[100lvh] top-0 left-0 -z-1">
      <Image src={src ?? '/babancong.webp'} alt='' fill objectFit='cover'/>
    </div>
  );
}