import { z } from 'zod';

/**
 * The error envelope every endpoint returns on failure (see docs/engineering/API.md).
 * `code` is stable SCREAMING_SNAKE_CASE that clients may switch on; `message` is
 * plain language for humans and must not leak internals.
 */
export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
