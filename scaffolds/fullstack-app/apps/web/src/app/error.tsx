'use client';

import { buttonVariants, cn } from '@repo/ui';
import { useEffect } from 'react';

/**
 * Global Next.js client-side error boundary.
 * Renders a clean error page with recovery controls if any child component crashes.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console or external error logging service
    console.error('[Root Error Boundary Caught Error]:', error);
  }, [error]);

  return (
    <section className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="mx-auto w-full max-w-xl text-center">
        <p className="text-destructive text-sm font-medium">Something went wrong</p>
        <h1 className="text-foreground mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          An unexpected error occurred
        </h1>
        <p className="text-muted-foreground mt-4 text-base">
          {error.message || 'We encountered an error while loading this page.'}
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <button
            type="button"
            onClick={() => reset()}
            className={cn(buttonVariants({ variant: 'primary' }))}
          >
            Try again
          </button>
          <a href="/" className={cn(buttonVariants({ variant: 'outline' }))}>
            Go back home
          </a>
        </div>
      </div>
    </section>
  );
}
