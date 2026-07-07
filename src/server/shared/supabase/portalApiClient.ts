import { Pool, type QueryResultRow } from "pg";

export type PortalApiQueryExecutor = <
  T extends QueryResultRow = QueryResultRow,
>(
  text: string,
  params?: unknown[],
) => Promise<T[]>;

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
    console.log(error);
    throw error;
  }
}

export async function withPortalApiTransaction<T>(
  callback: (query: PortalApiQueryExecutor) => Promise<T>,
): Promise<T> {
  const client = await getPortalApiPool().connect();
  const query: PortalApiQueryExecutor = async <
    T extends QueryResultRow = QueryResultRow,
  >(
    text: string,
    params: unknown[] = [],
  ): Promise<T[]> => {
    const result = await client.query<T>(text, params);
    return result.rows;
  };

  try {
    await client.query("begin");
    const result = await callback(query);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
