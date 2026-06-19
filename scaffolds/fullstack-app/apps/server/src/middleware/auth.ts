import { createClient, type User } from '@supabase/supabase-js';
import type { MiddlewareHandler } from 'hono';
import { errorBody } from '../lib/errors';

export interface AuthVariables {
  user: User;
}

export type AuthEnv = {
  Variables: AuthVariables;
};

export const requireAuth: MiddlewareHandler<AuthEnv> = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json(errorBody('UNAUTHORIZED', 'Access token is required.'), 401);
  }

  const token = authHeader.substring(7);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return c.json(errorBody('INTERNAL_SERVER_ERROR', 'Database configuration missing.'), 500);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) {
    return c.json(errorBody('UNAUTHORIZED', 'Invalid or expired token.'), 401);
  }

  c.set('user', user);
  await next();
};
