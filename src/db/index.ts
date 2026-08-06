// src/db/index.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Pastikan DATABASE_URL terbaca dengan benar
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

// Gunakan Neon HTTP client untuk performa serverless Vercel yang stabil
const sql = neon(connectionString);

export const db = drizzle(sql, { schema });