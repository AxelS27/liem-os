import type { MiddlewareHandler } from 'hono';

/**
 * Structured JSON logging middleware for Hono.
 * Outputs request metadata, status codes, and execution duration as a stringified JSON object.
 */
export const structuredLogger = (): MiddlewareHandler => {
  return async (c, next) => {
    const start = Date.now();
    const { method, url } = c.req;
    const path = new URL(url).pathname;

    await next();

    const durationMs = Date.now() - start;
    const status = c.res.status;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO',
      method,
      path,
      status,
      durationMs,
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown-ip',
    };

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(logEntry));
  };
};
