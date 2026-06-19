import { defineConfig } from '@trigger.dev/sdk/v3';

export default defineConfig({
  project: 'proj_placeholder_id', // Users will replace this with their actual Trigger.dev project ID
  runtime: 'node',
  logLevel: 'log',
  dirs: ['src/trigger'], // Specifies where Trigger.dev scans for background jobs
});
