import { buttonVariants, cn } from '@repo/ui';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { PreviewCarousel } from '@/components/shared/preview-carousel';
import { TechTicker } from '@/components/shared/tech-ticker';
import { defaultLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary(defaultLocale);
  return { title: t.home.metaTitle };
}

/*
 * This landing page is the DESIGN FOUNDATION for every product built from the template.
 * Build on it: swap the copy (src/i18n/locales/en.json), the accent palette, the preview
 * assets, and the routes to fit the product, and adjust sections as the product needs.
 * What stays unless docs/product/UI_UX.md calls for something different: the open-band
 * composition, nav shell, font wiring, and footer structure. Do not throw it away and
 * regenerate from scratch. See docs/engineering/DESIGN_DNA.md.
 */

// Icons pair by index with the feature copy in src/i18n/locales/en.json (home.features.items).
// Keep the two lists the same length and order.
const featureIcons: ReactNode[] = [
  <>
    <path d="m16 18 6-6-6-6" />
    <path d="m8 6-6 6 6 6" />
  </>,
  <>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </>,
  <>
    <rect width="7" height="7" x="3" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="14" rx="1" />
    <rect width="7" height="7" x="3" y="14" rx="1" />
  </>,
  <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />,
];

function FeatureIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export default async function HomePage() {
  // All rendered copy comes from the locale dictionary (ADR-010): no hardcoded strings,
  // so reskinning a product means editing en.json, not hunting strings through markup.
  const t = await getDictionary(defaultLocale);

  return (
    <>
      {/*
       * Centered hero, contained to a marketing measure so sparse content reads as a composed
       * page. The headline and CTAs sit in the first viewport while the preview below peeks
       * above the fold to invite scrolling.
       */}
      <section className="mx-auto w-full max-w-6xl px-6 pt-20 text-center sm:pt-28">
        <p className="text-muted-foreground animate-fade-slide-up animation-delay-0 text-sm font-medium">
          {t.home.eyebrow}
        </p>
        <h1 className="text-foreground animate-fade-slide-up animation-delay-100 mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          {t.home.headline}
        </h1>
        <p className="text-muted-foreground animate-fade-slide-up animation-delay-200 mx-auto mt-5 max-w-2xl text-base sm:text-lg">
          {t.home.subhead}
        </p>
        <div className="animate-fade-slide-up animation-delay-300 mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="/features"
            className={cn(buttonVariants({ size: 'lg' }), 'group w-full sm:w-auto')}
          >
            <span>{t.home.exploreFeatures}</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-1.5 h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
          <a
            href="/pricing"
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full sm:w-auto')}
          >
            {t.home.viewPricing}
          </a>
        </div>
      </section>

      {/* Product preview carousel: rotating screenshots in a contained 16:9 frame. */}
      <section className="animate-fade-slide-up animation-delay-400 mx-auto w-full max-w-5xl px-6 pt-16 sm:pt-20">
        <PreviewCarousel />
      </section>

      {/* Stack strip: horizontal scrolling ticker of the stack. */}
      <section className="mx-auto w-full max-w-6xl px-6 pt-16 sm:pt-20">
        <TechTicker heading={t.home.stackHeading} />
      </section>

      {/* Features: an open grid, hierarchy from spacing and type, not bordered cards. */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
            {t.home.features.heading}
          </h2>
          <p className="text-muted-foreground mt-4 text-base">{t.home.features.subheading}</p>
        </div>
        <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {t.home.features.items.map((feature, i) => (
            <div key={feature.title}>
              <div className="bg-secondary text-foreground flex h-10 w-10 items-center justify-center rounded-lg">
                <FeatureIcon>{featureIcons[i]}</FeatureIcon>
              </div>
              <h3 className="text-foreground mt-5 font-medium">{feature.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{feature.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Principles: a banded section for rhythm, the page is not one flat white scroll. */}
      <section className="border-border bg-secondary/30 border-y">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
              {t.home.foundations.heading}
            </h2>
            <p className="text-muted-foreground mt-4 text-base">{t.home.foundations.subheading}</p>
          </div>
          <dl className="mt-14 grid gap-10 text-left sm:grid-cols-3">
            {t.home.foundations.items.map((item) => (
              <div key={item.title}>
                <dt className="text-foreground font-medium">{item.title}</dt>
                <dd className="text-muted-foreground mt-2 text-sm">{item.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/*
       * Closing CTA: a soft contained band so the page ends on a clear next step without a
       * jarring near-black block. Dark/inverted CTA bands are opt-in only - use them when
       * docs/product/UI_UX.md explicitly calls for one (the Button inverse variants exist
       * for that case).
       */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
        <div className="border-border bg-secondary/40 rounded-2xl border px-8 py-14 text-center sm:px-16">
          <h2 className="text-foreground mx-auto max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
            {t.home.cta.heading}
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base">
            {t.home.cta.subheading}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="/signup"
              className={cn(buttonVariants({ size: 'lg' }), 'group w-full sm:w-auto')}
            >
              <span>{t.home.cta.getStarted}</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-1.5 h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
            <a
              href="/features"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full sm:w-auto')}
            >
              {t.home.cta.seeFeatures}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
