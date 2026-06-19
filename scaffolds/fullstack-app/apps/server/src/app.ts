import { swaggerUI } from '@hono/swagger-ui';
import { healthResponseSchema } from '@repo/types';
import * as Sentry from '@sentry/node';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';

import { notesRoutes } from './features/notes/notes.routes';
import { errorBody } from './lib/errors';
import { structuredLogger } from './middleware/logger';
import { rateLimiter } from './middleware/rate-limiter';
import openapiSpec from './openapi.json';

// Initialize Sentry if DSN is provided
const sentryDsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    tracesSampleRate: 1.0,
  });
}

// app.ts owns the Hono instance and route registration; features register here.
export const app = new Hono().basePath('/api/v1');

// Apply secure headers globally
app.use('*', secureHeaders());

// Apply CORS to restrict origins to the frontend application
const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'];
app.use(
  '*',
  cors({
    origin: (origin) => {
      // Allow request if origin matches allowed list, during local testing, or if empty (server-to-server)
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        return origin;
      }
      return allowedOrigins[0];
    },
    credentials: true,
  }),
);

// Apply structured logging globally
app.use('*', structuredLogger());

// Apply rate limiting globally (e.g., 100 requests per minute)
app.use('*', rateLimiter());

// Register global error handler to prevent internal trace/details leakage
app.onError((err, c) => {
  console.error('[Unhandled Server Error]:', err);
  if (sentryDsn) {
    Sentry.captureException(err);
  }
  return c.json(
    errorBody('INTERNAL_SERVER_ERROR', 'An unexpected error occurred. Please try again later.'),
    500,
  );
});

// Serve the OpenAPI specification
app.get('/openapi.json', (c) => c.json(openapiSpec));

// Serve interactive Swagger UI documentation
app.get('/docs', swaggerUI({ url: '/api/v1/openapi.json' }));

app.get('/health', (c) => c.json(healthResponseSchema.parse({ data: { status: 'ok' } })));

app.route('/notes', notesRoutes);
