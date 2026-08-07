import * as schema from './schema';
export declare const db: import('drizzle-orm/postgres-js').PostgresJsDatabase<typeof schema> & {
  $client: import('postgres').Sql<{}>;
};
