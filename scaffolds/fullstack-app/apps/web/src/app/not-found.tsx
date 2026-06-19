import { PlaceholderPage } from '@/components/shared/placeholder-page';
import { defaultLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

export default async function NotFound() {
  const t = await getDictionary(defaultLocale);
  return (
    <PlaceholderPage
      eyebrow={t.pages.notFound.eyebrow}
      title={t.pages.notFound.title}
      description={t.pages.notFound.description}
      homeLabel={t.pages.backToHome}
    />
  );
}
