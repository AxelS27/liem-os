import type { CreateNoteInput, ListNotesQuery, Note } from '@repo/types';

/*
 * Reference service for the starter `notes` feature. The service owns business logic
 * and persistence; routes never touch the store directly. This one keeps notes in
 * memory so the template runs with zero configuration - a real feature replaces the
 * Map with Supabase queries (see docs/engineering/DATABASE.md) and keeps the same
 * function signatures. Delete this feature once the product has a real one.
 */

const notes = new Map<string, Note>();

export function listNotes({ page, limit }: ListNotesQuery): {
  items: Note[];
  page: number;
  limit: number;
  total: number;
} {
  const all = [...notes.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const start = (page - 1) * limit;
  return {
    items: all.slice(start, start + limit),
    page,
    limit,
    total: all.length,
  };
}

export function getNote(id: string): Note | undefined {
  return notes.get(id);
}

export function createNote(input: CreateNoteInput): Note {
  const note: Note = {
    id: crypto.randomUUID(),
    title: input.title,
    body: input.body,
    createdAt: new Date().toISOString(),
  };
  notes.set(note.id, note);
  return note;
}

/** Test helper: the store is module state, so tests reset it between cases. */
export function clearNotes(): void {
  notes.clear();
}
