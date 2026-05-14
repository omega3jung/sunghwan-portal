import { Pool, QueryResultRow } from "pg";

// portal API only after login.
// portal_api DB connection use.
function getRequiredEnv(key: "PORTAL_DATABASE_URL"): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`[database] Missing required environment variable: ${key}`);
  }

  return value;
}

let portalPool: Pool | null = null;

export function getPortalApiPool(): Pool {
  if (!portalPool) {
    portalPool = new Pool({
      connectionString: getRequiredEnv("PORTAL_DATABASE_URL"),
      ssl: {
        rejectUnauthorized: false,
      },
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
      query_timeout: 10000,
    });
  }

  return portalPool;
}

export async function queryPortalApi<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const pool = getPortalApiPool();

  try {
    const result = await pool.query<T>(text, params);
    return result.rows;
  } catch (error) {
    throw error;
  }
}
