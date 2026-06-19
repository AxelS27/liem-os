import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn(
    'Warning: DATABASE_URL environment variable is missing. Database operations will fail.',
  );
}

// Create client connection
const client = postgres(databaseUrl || 'postgresql://localhost:5432/mock');

// Export initialized drizzle instance
export const db = drizzle(client, { schema });
