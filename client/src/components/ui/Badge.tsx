import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

const variants = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200',
  success: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  warning: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
};

export function Badge({ children, variant = 'default', className, ...props }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-sm font-medium', variants[variant], className)} {...props}>
      {children}
    </span>
  );
}
