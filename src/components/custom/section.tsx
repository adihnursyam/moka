import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type SectionOverlay = 'none' | 'dgb' | 'fb' | 'dark';

const overlayClasses: Record<Exclude<SectionOverlay, 'none'>, string> = {
  dgb: 'bg-dgb-50/90',
  fb: 'bg-fb-50/90',
  dark: 'bg-black/50',
};

type SectionProps = {
  id?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  background?: string;
  overlay?: SectionOverlay;
  contentClassName?: string;
};

export function Section({ id, className, style, children, background, overlay = 'none', contentClassName }: SectionProps) {
  return (
    <section
      id={id}
      className={cn('relative w-full px-8 py-12 md:px-20 md:py-20', background && 'bg-cover bg-center', className)}
      style={background ? { ...style, backgroundImage: `url(${background})` } : style}
    >
      {background && overlay !== 'none' ? (
        <div aria-hidden className={cn('pointer-events-none absolute inset-0', overlayClasses[overlay])} />
      ) : null}
      <div className={cn('relative', contentClassName)}>{children}</div>
    </section>
  );
}

export function Vignette({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-0 h-[100lvh] w-full bg-radial-[at_50%_50%] from-transparent to-90% to-dgb-800',
        className
      )}
    />
  );
}
