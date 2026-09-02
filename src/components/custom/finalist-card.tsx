import Image from 'next/image';
import Link from 'next/link';

type FinalistCardProps = {
  src: string;
  name: string;
  no: string;
  catt: string;
  href: string;
};

export function FinalistCard({ src, name, catt, no, href }: FinalistCardProps) {
  const [firstName, ...restName] = name.split(' ');
  return (
    <Link href={href} className="group relative aspect-square overflow-hidden rounded-md">
      <Image
        src={src}
        alt={name}
        width={300}
        height={400}
        priority
        className="h-full w-full object-cover object-center transition-all duration-500 group-hover:scale-102"
      />
      <div className="absolute bottom-0 w-full text-white transition-all duration-500 group-hover:opacity-0">
        <div className="leading-tight bg-gradient-to-t from-black/90 to-transparent p-6">
          <div className="flex justify-between text-2xl font-bold">
            <p>{catt}</p>
            <p>{firstName}</p>
          </div>
          <div className="flex justify-between text-2xl">
            <p>{no}</p>
            <p>{restName.join(' ')}</p>
          </div>
        </div>
        <div className="flex h-6 w-full items-center justify-center gap-10 bg-gradient-to-r from-fb via-fb-200 to-fb px-4 text-[10px] text-black">
          <p>mokagarut</p>
          <p>#nyundaturnyakola</p>
          <p>#kayakarya</p>
        </div>
      </div>
    </Link>
  );
}
