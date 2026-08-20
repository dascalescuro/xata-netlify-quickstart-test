import { neon } from '@neondatabase/serverless';
import type { Context } from '@netlify/functions';

export default async (request: Request, context: Context) => {
  const sql = neon(process.env.DATABASE_URL!);
  const users = await sql`SELECT * FROM users LIMIT 10`;
  return Response.json(users);
};

export const config = { path: '/api/users' };
