import type { Metadata } from 'next';

import { PlaceholderPage } from '@/components/shared/placeholder-page';
import { defaultLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary(defaultLocale);
  return { title: t.pages.contact.metaTitle };
}

export default async function ContactPage() {
  const t = await getDictionary(defaultLocale);
  return (
    <PlaceholderPage
      eyebrow={t.pages.contact.eyebrow}
      title={t.pages.contact.title}
      description={t.pages.contact.description}
      homeLabel={t.pages.backToHome}
    />
  );
}
