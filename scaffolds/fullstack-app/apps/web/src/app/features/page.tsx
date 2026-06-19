import type { Metadata } from 'next';

import { PlaceholderPage } from '@/components/shared/placeholder-page';
import { defaultLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary(defaultLocale);
  return { title: t.pages.features.metaTitle };
}

export default async function FeaturesPage() {
  const t = await getDictionary(defaultLocale);
  return (
    <PlaceholderPage
      eyebrow={t.pages.features.eyebrow}
      title={t.pages.features.title}
      description={t.pages.features.description}
      homeLabel={t.pages.backToHome}
    />
  );
}
