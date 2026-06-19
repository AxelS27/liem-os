# API Contract

## Conventions

- Built with **Hono**. Every route validates input (body, query, params) with a **Zod** schema at the boundary before any logic runs.
- Base URL: `/api/v1`
- Auth: `Authorization: Bearer <token>` (Supabase Auth session token).
- Content-Type: `application/json`
- Request/response contracts are **Zod schemas in `packages/types`**, imported by both apps. The server validates with the schema; the client infers its types from it.
- Backend implementation rules live in `docs/engineering/BACKEND.md`. Payment-specific endpoints and
  webhooks must also follow `docs/engineering/PAYMENTS.md`.

## Success Envelope

```json
{ "data": {} }
```

## Error Envelope

```json
{ "error": { "code": "RESOURCE_NOT_FOUND", "message": "Human readable message" } }
```

## Standard Status Codes

| Code | Meaning          |
| ---- | ---------------- |
| 200  | OK               |
| 201  | Created          |
| 400  | Validation error |
| 401  | Unauthenticated  |
| 403  | Unauthorized     |
| 404  | Not found        |
| 409  | Conflict         |
| 500  | Server error     |

---

## Example Endpoint

### `GET /api/v1/health`

Check that the API is running.

**Request**

```
GET /api/v1/health
```

**Response - 200**

```json
{ "data": { "status": "ok" } }
```

Contract: `healthResponseSchema` in `packages/types`.

This endpoint is for infrastructure checks and internal verification. Do not surface it as
a public website widget, footer badge, or marketing-page status panel. Product UI should
not reveal provider names, API latency, uptime diagnostics, build hashes, or environment
details unless the user explicitly asks for a developer/status product.

---

## Reference Feature: Notes

The starter ships `apps/server/src/features/notes` as the backend pattern to copy: shared
Zod contracts, boundary validation, thin routes, a service, the standard envelopes, and
contract tests. It stores notes in memory (no auth, no database) so the template runs with
zero configuration. **Replace or delete it once the product has a real feature** - it is a
teaching scaffold, not a product capability.

Contracts: `noteSchema`, `createNoteInputSchema`, `listNotesQuerySchema`,
`noteResponseSchema`, `notesListResponseSchema` in `packages/types`.

### `GET /api/v1/notes?page=&limit=`

Paginated list. `page` >= 1 (default 1), `limit` 1-100 (default 20). Out-of-range values
return the 400 validation envelope.

```json
{ "data": { "items": [], "page": 1, "limit": 20, "total": 0 } }
```

### `GET /api/v1/notes/:id`

Single note, or `404` with the stable code `NOTE_NOT_FOUND`.

### `POST /api/v1/notes`

Body `{ "title": string (1-200), "body"?: string (<=2000) }`. Returns `201` with the
created note, or `400` with code `VALIDATION_ERROR`.

```json
{ "data": { "id": "…", "title": "…", "body": "", "createdAt": "…" } }
```

---

## Consistency Rules

- Resource names plural, lowercase: `/users`, `/orders`.
- Always wrap payloads in `data` / `error` envelopes.
- Never return raw arrays at the top level (wrap in `data`).
- Error `code` is SCREAMING_SNAKE_CASE and stable (clients may switch on it).
- New endpoint → add its Zod schema to `packages/types` first, then implement the route against it.

---

## Payments & Auth (when used)

- **Auth flows** (sign up, sign in, OAuth with Google/GitHub, password reset, avatar upload) run through the **Supabase SDK** from `apps/web`, not custom API endpoints. Add a server endpoint only for trusted operations that need the service-role key.
- **Payment webhook** (e.g. `POST /api/v1/payments/notification`) is the one route that is **not** Bearer-authenticated: Midtrans calls it server-to-server, so verify the **signature hash** instead (SHA512 of `order_id + status_code + gross_amount + server_key`). Still validate the body with Zod like any other route, and treat it as the source of truth for order status. See ADR-012.
