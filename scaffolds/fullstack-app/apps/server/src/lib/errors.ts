import type { ErrorResponse } from '@repo/types';
import type { ZodError } from 'zod';

/** Shape the error envelope from docs/engineering/API.md: stable code, human message. */
export function errorBody(code: string, message: string): ErrorResponse {
  return { error: { code, message } };
}

/**
 * Turn a Zod boundary failure into the standard 400 envelope. Only the first issue
 * is surfaced - enough for the client to fix the request without leaking internals.
 */
export function validationErrorBody(error: ZodError): ErrorResponse {
  const issue = error.issues[0];
  const path = issue?.path.join('.');
  const message = issue ? (path ? `${path}: ${issue.message}` : issue.message) : 'Invalid request.';
  return errorBody('VALIDATION_ERROR', message);
}
