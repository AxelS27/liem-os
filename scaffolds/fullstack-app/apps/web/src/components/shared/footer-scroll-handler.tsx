'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * A client-side wrapper that intercepts clicks on links inside the footer.
 * If a link points to the current page (same pathname, no hash), it scrolls
 * the viewport smoothly to the top instead of causing a page reload.
 */
export function FooterScrollHandler({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');

    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    try {
      const targetUrl = new URL(href, window.location.href);

      // Only intercept if same-origin, same pathname, and does not target a specific hash
      const isSamePage =
        targetUrl.origin === window.location.origin && targetUrl.pathname === pathname;
      const isScrollToTop = !targetUrl.hash || targetUrl.hash === '#top' || targetUrl.hash === '#';

      if (isSamePage && isScrollToTop) {
        e.preventDefault();

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({
          top: 0,
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
      }
    } catch {
      // Ignore URL parsing errors for external/special hrefs
    }
  };

  return <div onClick={handleClick}>{children}</div>;
}
