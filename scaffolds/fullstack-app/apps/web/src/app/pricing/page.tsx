import type { Metadata } from 'next';

import { PlaceholderPage } from '@/components/shared/placeholder-page';
import { defaultLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary(defaultLocale);
  return { title: t.pages.pricing.metaTitle };
}

export default async function PricingPage() {
  const t = await getDictionary(defaultLocale);
  return (
    <PlaceholderPage
      eyebrow={t.pages.pricing.eyebrow}
      title={t.pages.pricing.title}
      description={t.pages.pricing.description}
      homeLabel={t.pages.backToHome}
    />
  );
}
