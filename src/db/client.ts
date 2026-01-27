import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export interface Env extends Record<string, unknown> {
  shlink_db: D1Database;
}

export const createDb = (env: Env) => {
  return drizzle(env.shlink_db, { schema });
};
