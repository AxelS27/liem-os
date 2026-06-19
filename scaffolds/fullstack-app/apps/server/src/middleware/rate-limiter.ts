import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { MiddlewareHandler } from 'hono';
import { errorBody } from '../lib/errors';

interface ClientRequestRecord {
  timestamps: number[];
}

const clientRequestStore = new Map<string, ClientRequestRecord>();

// Initialize Upstash Redis client if credentials exist in the environment
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let upstashRateLimit: Ratelimit | null = null;

if (redisUrl && redisToken) {
  try {
    upstashRateLimit = new Ratelimit({
      redis: new Redis({
        url: redisUrl,
        token: redisToken,
      }),
      limiter: Ratelimit.slidingWindow(100, '60 s'),
    });
  } catch (err) {
    console.error('Failed to initialize Upstash Redis rate limiter:', err);
  }
}

/**
 * Sliding-window rate limiter middleware.
 * Uses Upstash Redis for shared serverless rate limiting,
 * and falls back to a local in-memory sliding-window limiter.
 */
export const rateLimiter = (
  options: { limit: number; windowMs: number } = { limit: 100, windowMs: 60 * 1000 },
): MiddlewareHandler => {
  return async (c, next) => {
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown-ip';
    const now = Date.now();

    // 1. Try Upstash Redis Rate Limiting (Serverless-optimized)
    if (upstashRateLimit) {
      try {
        const { success, limit, reset, remaining } = await upstashRateLimit.limit(ip);

        c.header('X-RateLimit-Limit', String(limit));
        c.header('X-RateLimit-Remaining', String(remaining));
        c.header('X-RateLimit-Reset', String(reset));

        if (!success) {
          c.header('Retry-After', String(Math.ceil((reset - now) / 1000)));
          return c.json(
            errorBody('TOO_MANY_REQUESTS', 'Rate limit exceeded. Please try again later.'),
            429,
          );
        }

        await next();
        return;
      } catch (err) {
        console.error('Upstash ratelimit failed, falling back to local in-memory:', err);
      }
    }

    // 2. Local In-Memory Fallback
    let record = clientRequestStore.get(ip);
    if (!record) {
      record = { timestamps: [] };
      clientRequestStore.set(ip, record);
    }

    // Filter timestamps outside of the sliding window
    record.timestamps = record.timestamps.filter((t) => now - t < options.windowMs);

    if (record.timestamps.length >= options.limit) {
      c.header('Retry-After', String(Math.ceil(options.windowMs / 1000)));
      return c.json(
        errorBody('TOO_MANY_REQUESTS', 'Rate limit exceeded. Please try again later.'),
        429,
      );
    }

    record.timestamps.push(now);
    await next();
  };
};
