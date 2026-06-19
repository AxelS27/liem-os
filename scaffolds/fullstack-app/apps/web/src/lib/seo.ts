import type { Metadata } from 'next';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
}

/**
 * Utility helper to generate standard SEO metadata tags.
 * Helps prevent duplicate configurations across different Next.js pages.
 */
export function constructMetadata({
  title,
  description = 'Axel Monorepo Starter - The ultimate fast, type-safe template.',
  image = '/icon.png',
  noIndex = false,
}: SEOProps = {}): Metadata {
  const defaultTitle = 'Axel Monorepo App';
  const displayTitle = title ? `${title} | ${defaultTitle}` : defaultTitle;

  return {
    title: displayTitle,
    description,
    openGraph: {
      title: displayTitle,
      description,
      images: [
        {
          url: image,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: displayTitle,
      description,
      images: [image],
      creator: '@AxelS27',
    },
    icons: {
      icon: '/icon.png',
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
