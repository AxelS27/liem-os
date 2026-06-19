-- Seed data for local Supabase development.
-- Keep this deterministic and safe to run after `supabase db reset`.

-- Create a mock test user in auth.users
-- Password will be 'password123' (encrypted)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  email_change_token_new,
  email_change,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reconfirmation_token,
  is_sso_user,
  deleted_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'd9c84e1b-3b32-4e9f-9c04-58a2e21b7c89',
  'authenticated',
  'authenticated',
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"display_name": "Test User"}',
  FALSE,
  now(),
  now(),
  NULL,
  NULL,
  '',
  '',
  '',
  '',
  '',
  0,
  NULL,
  '',
  FALSE,
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- Create an identity for the test user to allow standard logins
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES (
  'd9c84e1b-3b32-4e9f-9c04-58a2e21b7c89',
  'd9c84e1b-3b32-4e9f-9c04-58a2e21b7c89',
  jsonb_build_object('sub', 'd9c84e1b-3b32-4e9f-9c04-58a2e21b7c89', 'email', 'test@example.com'),
  'email',
  now(),
  now(),
  now()
)
ON CONFLICT (provider, id) DO NOTHING;
