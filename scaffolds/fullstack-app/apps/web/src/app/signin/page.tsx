import { buttonVariants, cn } from '@repo/ui';
import type { Metadata } from 'next';

import { PlaceholderPage } from '@/components/shared/placeholder-page';
import { defaultLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary(defaultLocale);
  return { title: t.pages.signIn.metaTitle };
}

export default async function SignInPage() {
  const t = await getDictionary(defaultLocale);
  return (
    <PlaceholderPage
      eyebrow={t.pages.signIn.eyebrow}
      title={t.pages.signIn.title}
      description={t.pages.signIn.description}
      action={
        <a href="/signup" className={cn(buttonVariants())}>
          {t.pages.signIn.action}
        </a>
      }
    />
  );
}
