import type { HTMLAttributes } from 'react';

import { cn } from '../../lib/cn';

/**
 * Reusable pulse loading skeleton placeholder.
 * Used to avoid blank pages or heavy spinners during asynchronous operations.
 */
function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('bg-muted animate-pulse rounded-md', className)} {...props} />;
}

export { Skeleton };
