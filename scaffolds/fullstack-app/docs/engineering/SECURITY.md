# Security

> Open this for security-related decisions, audit checklists, route guards, database RLS design, webhook verification, and secret isolation guidelines.

## Role

This document acts as the absolute security reference for the monorepo. Our core security philosophy is **defense in depth**: never trust the client, validate everything at the boundary, enforce strict access control at the database level, and isolate secret credentials.

---

## 1. Authentication & Authorization

We use **Supabase Auth** as the single source of truth for user identity.

### Frontend Route Protection (`apps/web`)

- **Next.js Middleware**: Protect private routes (e.g. `/dashboard/*`, `/settings/*`) in the Next.js middleware. The middleware must check for a valid Supabase session and redirect to `/login` if none is found.
- **Client-Side Auth State**: Always use the `@supabase/ssr` package for managing cookies and session state.
- **State Exclusion**:
  - Signed-out state: Show "Sign in" or login links.
  - Signed-in state: Show "Account" or dashboard controls.
  - Never display both states at once or render auth links in redundant positions.

### Backend Route Protection (`apps/server`)

- **JWT Verification**: Every protected route in `apps/server` must parse and verify the Supabase JWT.
- **Do Not Trust Client IDs**: When fetching or writing data for a user, never trust a `userId` sent in the request body or query params. Instead, extract the user ID directly from the validated JWT payload (e.g., `c.get('user').id`) and use that for DB queries.
- **Public vs. Protected**: Clearly mark public endpoints (like landing page status endpoints or public product catalogs) and separate them from protected endpoints via router-level middleware groups.

---

## 2. Database & Storage Security (Supabase / Postgres)

Database security is enforced via PostgreSQL policies directly at the database layer.

### Row Level Security (RLS)

- **RLS is mandatory on every user-facing table.** No exceptions.
- Every migration creating a table must explicitly enable RLS:
  ```sql
  ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;
  ```
- Write granular policies for `SELECT`, `INSERT`, `UPDATE`, and `DELETE`.
- Example of a secure policy mapping ownership:
  ```sql
  CREATE POLICY "Users can only read their own items"
    ON public.my_table
    FOR SELECT
    USING (auth.uid() = user_id);
  ```

### Storage Buckets

- Buckets that store user-uploaded files must enable RLS.
- Use path-based RLS rules to ensure users can only upload to and read from their own folders (e.g., `(storage.foldername(name))[1] = auth.uid()::text`).

### Service-Role Key Rules

- The `service_role` key bypasses RLS policies.
- **NEVER** import or use the `service_role` key in `apps/web`.
- The `service_role` key must only reside in `apps/server` and must be used sparingly—only for system/admin operations that genuinely require bypassing user-level RLS.

---

## 3. API Boundary Protection

`apps/server` is our trusted boundary. It must shield our system from malicious inputs and leaks.

### Boundary Validation

- Validate every external input using **Zod** at the route level before any business logic runs.
- Validate request query parameters, URL path parameters, and request bodies.
- Enforce strict schemas: reject unknown fields (using `.strict()`) when handling sensitive updates.
- Set reasonable body limits on requests to prevent Denial of Service (DoS) attacks.

### Error Handling & Information Leakage

- **Never leak stack traces, internal SQL errors, ORM details, or server paths** to the API client.
- Database exceptions (e.g., primary key violations, foreign key failures) must be caught at the service level and translated into sanitized, stable machine-readable codes.
- Response payload format for errors:
  ```json
  {
    "error": {
      "code": "BAD_REQUEST",
      "message": "The request payload is invalid."
    }
  }
  ```

### Secure HTTP Headers

- Ensure Hono uses secure headers middleware to set:
  - `Strict-Transport-Security` (HSTS)
  - `X-Frame-Options` (`DENY` or `SAMEORIGIN` to prevent clickjacking)
  - `X-Content-Type-Options` (`nosniff`)
  - `Content-Security-Policy` (CSP)
  - `Referrer-Policy`

---

## 4. Payment Integrity (Midtrans)

For projects taking payments, **Midtrans** is used. Payment validation must be bulletproof to prevent financial loss.

### Webhook Signature Verification

- Do not trust webhook payloads on basic bearer tokens alone.
- **Verifying the signature is mandatory.** You must calculate the SHA-512 hash using the parameters provided by Midtrans and the private Server Key:
  $$\text{hash} = \text{SHA512}(\text{order\_id} + \text{status\_code} + \text{gross\_amount} + \text{ServerKey})$$
- Match the calculated hash against the `signature_key` header/field in the payload. If it doesn't match, reject the request with `401 Unauthorized` immediately.

### Secret Isolation

- The Midtrans client key (`NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`) is public and used in the web app to open Snap.
- The Midtrans server key must **never** be prefix-exposed or loaded in the frontend. It is server-only.

---

## 5. Secret & Key Management

### Environment Variables

- Environment variables prefixed with `NEXT_PUBLIC_` are bundled into the client browser build.
- **Never prefix private secrets** (such as database credentials, payment secret keys, Hugging Face tokens, or auth signing keys) with `NEXT_PUBLIC_`.
- Run checks to ensure that no secret variables are referenced in frontend components.

### Local Development Safety

- Keep all local configurations in `.env.local` or `.env` which are git-ignored by default.
- Never commit private credentials to git. Only push `.env.example` containing placeholders.

---

## 6. AI & Model Security

- **Server-Side Calls Only**: All calls to Hugging Face or other large model APIs must be performed server-side in `apps/server`.
- **Token Protection**: Hugging Face tokens must be stored as server environment variables and never sent to the browser.
- **Input Sanitization**: Sanitize user inputs before forwarding them to AI prompts to prevent injection attacks or prompt manipulation designed to leak system instructions.

---

## 7. Security Audit Checklist (Definition of Done)

Before approving any PR or marking a task done, ask these questions:

- [ ] **RLS:** If a new database table or storage bucket was added, is RLS enabled, and are policies written for all operations?
- [ ] **Input Validation:** Are all route parameters and request bodies parsed and verified via Zod?
- [ ] **Auth Guards:** Are all protected routes wrapped in an authentication middleware?
- [ ] **Secret Leaks:** Did you verify that no secret keys were added to client-side code or named with `NEXT_PUBLIC_`?
- [ ] **Webhooks:** If a new webhook was added, is signature verification implemented?
- [ ] **Error Leakage:** Does the endpoint catch internal exceptions and return a sanitized error envelope?
- [ ] **Environment:** Have you updated `.env.example` if a new environment variable is introduced, and kept the actual secret out of git?
