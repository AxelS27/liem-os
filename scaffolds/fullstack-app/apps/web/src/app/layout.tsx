import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { SiteFooter } from '@/components/shared/site-footer';
import { SiteHeader } from '@/components/shared/site-header';
import { ThemeProvider } from '@/components/theme-provider';
import { defaultLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

import '../styles/globals.css';

/**
 * Real typeface, wired once. The template must never fall back to the browser default
 * (Times/serif) or a bland system stack - that is an instant generic-AI tell and the most
 * common cause of a "weird font" landing page.
 *
 * This loads a deliberate modern sans as `--font-jakarta`, which globals.css feeds into
 * the `--font-sans` theme token (Tailwind v4 `@theme inline`). To give a product its own
 * type identity, swap this import for another next/font family (one or two families total,
 * no decorative serif-italic), rename the variable to match (e.g. `--font-inter`), and
 * update the two var() references in globals.css. See docs/engineering/FRONTEND.md
 * (Typography) and the shadcn-ui skill.
 */
const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary(defaultLocale);
  return {
    title: {
      default: t.app.name,
      template: `%s | ${t.app.name}`,
    },
    description: t.app.description,
  };
}

/**
 * Persistent public shell. The header and footer live here so every route (including stubs
 * and the not-found page) shares the same navigation and endcap, and the shell stays mounted
 * while only the page content swaps. A product that adds signed-in or auth areas should split
 * these into route-group layouts (public / app / auth) per docs/engineering/FRONTEND.md.
 */
export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  // The header is a client island (it needs usePathname), so it cannot await the
  // dictionary itself; the layout resolves the strings and passes them down as props.
  const t = await getDictionary(defaultLocale);

  return (
    <html lang={defaultLocale} className={fontSans.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="bg-background text-foreground flex min-h-dvh flex-col">
            <SiteHeader brand={t.app.name} labels={t.nav} />
            <main className="flex flex-1 flex-col">{children}</main>
            <SiteFooter />
          </div>
          <Toaster closeButton richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
