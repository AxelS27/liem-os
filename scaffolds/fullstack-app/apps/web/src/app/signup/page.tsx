import { buttonVariants, cn } from '@repo/ui';
import type { Metadata } from 'next';

import { PlaceholderPage } from '@/components/shared/placeholder-page';
import { defaultLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary(defaultLocale);
  return { title: t.pages.signUp.metaTitle };
}

export default async function SignUpPage() {
  const t = await getDictionary(defaultLocale);
  return (
    <PlaceholderPage
      eyebrow={t.pages.signUp.eyebrow}
      title={t.pages.signUp.title}
      description={t.pages.signUp.description}
      action={
        <a href="/signin" className={cn(buttonVariants({ variant: 'outline' }))}>
          {t.pages.signUp.action}
        </a>
      }
    />
  );
}
