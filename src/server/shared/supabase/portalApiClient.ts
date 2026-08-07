import { Pool, type QueryResultRow } from "pg";

/**
 * Server-only PostgreSQL access for the portal API.
 *
 * The pool is created lazily so importing a server module does not open a
 * connection by itself. Browser code must use an HTTP client instead of
 * importing this module, because the database URL and connection are trusted
 * server resources.
 */

export type PortalApiQueryExecutor = <
  T extends QueryResultRow = QueryResultRow,
>(
  text: string,
  params?: unknown[],
) => Promise<T[]>;

function getRequiredEnv(key: "PORTAL_DATABASE_URL"): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`[database] Missing required environment variable: ${key}`);
  }

  return value;
}

let portalPool: Pool | null = null;

/** Returns the shared PostgreSQL pool used by server-side portal repositories. */
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

/** Runs one independent query against the shared pool. */
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

/**
 * Runs a multi-query workflow on one connection and commits it atomically.
 *
 * Callers must pass the supplied `query` executor to every repository involved
 * in the workflow. Falling back to `queryPortalApi` inside the callback would
 * use another pooled connection and place that operation outside this
 * transaction. Any thrown error rolls back before the connection is released.
 */
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
