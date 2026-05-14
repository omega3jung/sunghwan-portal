import { Pool, QueryResultRow } from "pg";

// auth API only using login.
// auth_api DB connection use.

let pool: Pool | null = null;

function getAuthApiPool() {
  if (!pool) {
    const connectionString = process.env.AUTH_DATABASE_URL;

    if (!connectionString) {
      throw new Error("AUTH_DATABASE_URL is not defined");
    }

    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  return pool;
}

export async function queryAuthApi<T extends QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const result = await getAuthApiPool().query<T>(text, params);
  return result.rows;
}
