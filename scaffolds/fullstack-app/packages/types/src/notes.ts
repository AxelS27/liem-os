import { z } from 'zod';

/*
 * Contracts for the starter `notes` feature (apps/server/src/features/notes), the
 * reference backend module. Schemas live here - not in route files - so web and
 * server share one source of truth (ADR-006). Follow this file's shape when adding
 * a real resource: entity schema, input schema(s), query schema, response envelopes.
 */

export const noteSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  createdAt: z.string(), // ISO timestamp
});

export const createNoteInputSchema = z.object({
  title: z.string().min(1, 'Title is required.').max(200),
  body: z.string().max(2000).default(''),
});

// List endpoints are always paginated (docs/engineering/BACKEND.md). Coerce because
// query params arrive as strings.
export const listNotesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const noteResponseSchema = z.object({
  data: noteSchema,
});

export const notesListResponseSchema = z.object({
  data: z.object({
    items: z.array(noteSchema),
    page: z.number(),
    limit: z.number(),
    total: z.number(),
  }),
});

export type Note = z.infer<typeof noteSchema>;
export type CreateNoteInput = z.infer<typeof createNoteInputSchema>;
export type ListNotesQuery = z.infer<typeof listNotesQuerySchema>;
export type NoteResponse = z.infer<typeof noteResponseSchema>;
export type NotesListResponse = z.infer<typeof notesListResponseSchema>;
