import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { typography } from '@/components/custom/typography';

type SectionHeaderProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  onDark?: boolean;
  titleClassName?: string;
  className?: string;
};

export function SectionHeader({ eyebrow, title, description, align = 'left', onDark = false, titleClassName, className }: SectionHeaderProps) {
  const centered = align === 'center';
  return (
    <div className={cn('space-y-3', centered && 'text-center', className)}>
      {eyebrow ? <typography.t1 className={cn(centered && 'mx-auto')}>{eyebrow}</typography.t1> : null}
      <typography.h1 className={cn(onDark && 'text-white', titleClassName)}>{title}</typography.h1>
      {description ? (
        <typography.p className={cn('max-w-2xl', onDark && 'text-[#ddd]', centered && 'mx-auto')}>{description}</typography.p>
      ) : null}
    </div>
  );
}
