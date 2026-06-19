-- Security Helper functions for Row Level Security (RLS) policies.
-- Safe to run in local development and production.

-- Helper to get the current session user's email from the JWT claims.
create or replace function auth.email()
returns text as $$
  select nullif(current_setting('request.jwt.claims', true)::json->>'email', '')::text;
$$ language sql stable security definer;

-- Helper to check if the current session user is marked as an admin in app_metadata.
create or replace function auth.is_admin()
returns boolean as $$
  select coalesce(
    (current_setting('request.jwt.claims', true)::json->'app_metadata'->>'is_admin')::boolean,
    false
  );
$$ language sql stable security definer;
