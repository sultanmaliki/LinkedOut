import 'dotenv/config';
import postgres from 'postgres';
const connectionString = process.env.DATABASE_URL;
export const client = postgres(connectionString);
