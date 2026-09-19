import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',

  schema: './src/schema/index.ts',

  out: './drizzle',

  // drizzle-kit push/generate/migrate need a session-capable connection, not
  // the transaction-mode pooler the app runtime uses (see client.ts) --
  // transaction mode can break the advisory locks and multi-statement DDL
  // some migrations rely on. DIRECT_DATABASE_URL is the same database via
  // Supabase's session-mode pooler (port 5432); falls back to DATABASE_URL
  // for environments with only one connection string (e.g. CI's scratch
  // Postgres container, which isn't behind any pooler).
  dbCredentials: {
    url: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL!,
  },

  verbose: true,
  strict: true,
});
