import {
  createNoteInputSchema,
  listNotesQuerySchema,
  noteResponseSchema,
  notesListResponseSchema,
} from '@repo/types';
import { Hono } from 'hono';

import { errorBody, validationErrorBody } from '../../lib/errors';
import { type AuthEnv, requireAuth } from '../../middleware/auth';
import { createNote, getNote, listNotes } from './notes.service';

/*
 * Reference routes for the starter `notes` feature: this is the route pattern to copy
 * for real resources. Handlers stay thin - validate at the boundary with the shared
 * Zod contract, call the service, shape the envelope. Schemas live in packages/types,
 * never here (docs/engineering/BACKEND.md, docs/engineering/API.md).
 */
export const notesRoutes = new Hono<AuthEnv>();

// Apply requireAuth middleware to all notes routes to protect them
notesRoutes.use('*', requireAuth);

// GET /notes?page=&limit= - paginated list; list endpoints are never unbounded.
notesRoutes.get('/', (c) => {
  const query = listNotesQuerySchema.safeParse(c.req.query());
  if (!query.success) {
    return c.json(validationErrorBody(query.error), 400);
  }

  return c.json(notesListResponseSchema.parse({ data: listNotes(query.data) }));
});

// GET /notes/:id - stable SCREAMING_SNAKE_CASE code on the error envelope.
notesRoutes.get('/:id', (c) => {
  const note = getNote(c.req.param('id'));
  if (!note) {
    return c.json(errorBody('NOTE_NOT_FOUND', 'No note was found for this id.'), 404);
  }

  return c.json(noteResponseSchema.parse({ data: note }));
});

// POST /notes - body validated before any logic runs; created resources return 201.
notesRoutes.post('/', async (c) => {
  const body = createNoteInputSchema.safeParse(await c.req.json().catch(() => null));
  if (!body.success) {
    return c.json(validationErrorBody(body.error), 400);
  }

  return c.json(noteResponseSchema.parse({ data: createNote(body.data) }), 201);
});
