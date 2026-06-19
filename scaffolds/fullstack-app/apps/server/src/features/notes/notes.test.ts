import { errorResponseSchema, noteResponseSchema, notesListResponseSchema } from '@repo/types';
import type { User } from '@supabase/supabase-js';
import type { MiddlewareHandler } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the requireAuth middleware to bypass token verification in tests
vi.mock('../../middleware/auth', () => {
  const requireAuth: MiddlewareHandler = async (c, next) => {
    c.set('user', { id: 'test-user-id', email: 'test@example.com' } as unknown as User);
    await next();
  };
  return { requireAuth };
});

import { app } from '../../app';
import { clearNotes } from './notes.service';

describe('notes routes', () => {
  beforeEach(() => {
    clearNotes();
  });

  it('lists notes in the paginated envelope', async () => {
    const response = await app.request('/api/v1/notes');
    expect(response.status).toBe(200);

    const body = notesListResponseSchema.parse(await response.json());
    expect(body.data).toEqual({ items: [], page: 1, limit: 20, total: 0 });
  });

  it('creates a note and returns it with 201', async () => {
    const response = await app.request('/api/v1/notes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'First note' }),
    });
    expect(response.status).toBe(201);

    const body = noteResponseSchema.parse(await response.json());
    expect(body.data.title).toBe('First note');
    expect(body.data.body).toBe('');

    const list = notesListResponseSchema.parse(await (await app.request('/api/v1/notes')).json());
    expect(list.data.total).toBe(1);
    expect(list.data.items[0]?.id).toBe(body.data.id);
  });

  it('rejects an invalid body with the 400 validation envelope', async () => {
    const response = await app.request('/api/v1/notes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: '' }),
    });
    expect(response.status).toBe(400);

    const body = errorResponseSchema.parse(await response.json());
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects an out-of-range list query', async () => {
    const response = await app.request('/api/v1/notes?limit=500');
    expect(response.status).toBe(400);

    const body = errorResponseSchema.parse(await response.json());
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns the 404 envelope with a stable code for a missing note', async () => {
    const response = await app.request('/api/v1/notes/does-not-exist');
    expect(response.status).toBe(404);

    const body = errorResponseSchema.parse(await response.json());
    expect(body.error.code).toBe('NOTE_NOT_FOUND');
  });
});
