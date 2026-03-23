// Source - https://stackoverflow.com/a/78329787
// Posted by Arsh Ergon
// Retrieved 2026-03-23, License - CC BY-SA 4.0

import * as schema from './schema';
import 'dotenv/config';
import { type LibSQLDatabase, drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client/http';

export function tursoClient(): LibSQLDatabase<typeof schema> {
  const url = import.meta.env.TURSO_URL?.trim();
  if (url === undefined) {
    throw new Error('TURSO_URL is not defined', url);
  }

  const authToken = import.meta.env.TURSO_AUTH_TOKEN?.trim();
  if (authToken === undefined) {
    if (!url.includes('file:')) {
      throw new Error('TURSO_AUTH_TOKEN is not defined');
    }
  }

  return drizzle(
    createClient({
      url,
      authToken
    }),
    { schema }
  );
}

