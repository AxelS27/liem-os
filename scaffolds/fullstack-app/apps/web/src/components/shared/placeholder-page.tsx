import { buttonVariants, cn } from '@repo/ui';
import type { ReactNode } from 'react';

/**
 * A complete-feeling page body for routes that are scaffolded but not built yet, and for the
 * not-found page. It fills the available height and centers its content so the shared footer
 * reads as a natural page end instead of appearing under sparse content. Replace these stubs
 * with real pages as the product grows.
 */
export function PlaceholderPage({
  eyebrow,
  title,
  description,
  action,
  homeLabel,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  /** Custom action; when omitted, a "back to home" link renders using homeLabel. */
  action?: ReactNode;
  /** Label for the default home link (pages.backToHome in the dictionary). */
  homeLabel?: string;
}) {
  return (
    <section className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="mx-auto w-full max-w-xl text-center">
        {eyebrow ? <p className="text-muted-foreground text-sm font-medium">{eyebrow}</p> : null}
        <h1 className="text-foreground mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="text-muted-foreground mt-4 text-base">{description}</p>
        <div className="mt-8 flex justify-center">
          {action ?? (
            <a href="/" className={cn(buttonVariants({ variant: 'outline' }))}>
              {homeLabel}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
