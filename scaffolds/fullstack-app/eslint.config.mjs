import nextConfig from './packages/config/eslint/next.js';
import nodeConfig from './packages/config/eslint/node.js';

export default [
  {
    ignores: ['**/dist/**', '**/.next/**', '**/.turbo/**', '**/node_modules/**', '**/coverage/**'],
  },
  // Map node configuration (Node globals + base rules) to backend & utility files
  ...nodeConfig.map((config) => {
    // If the config object already has ignores, we don't want to override files
    if (config.ignores) {
      return config;
    }
    return {
      ...config,
      files: [
        'apps/server/**/*.{ts,tsx,js,mjs}',
        'packages/utils/**/*.{ts,tsx,js,mjs}',
        'packages/types/**/*.{ts,tsx,js,mjs}',
        'packages/config/**/*.{ts,tsx,js,mjs}',
        'scripts/**/*.{ts,tsx,js,mjs}',
      ],
    };
  }),
  // Map next configuration (Next/React rules, AI tell checks + base rules) to frontend files
  ...nextConfig.map((config) => {
    // If the config object already has ignores, we don't want to override files
    if (config.ignores) {
      return config;
    }
    return {
      ...config,
      files: ['apps/web/**/*.{ts,tsx,js,mjs}', 'packages/ui/**/*.{ts,tsx,js,mjs}'],
    };
  }),
];
