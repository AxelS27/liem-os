import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Internal packages are consumed as TypeScript source (see docs/engineering/ARCHITECTURE.md),
  // so Next must transpile them.
  transpilePackages: ['@repo/ui', '@repo/types', '@repo/utils', '@repo/emails'],
  turbopack: {},
};

export default withSentryConfig(nextConfig, {
  silent: true,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
});
