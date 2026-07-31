import type { PortalApiQueryExecutor } from "@/server/shared/supabase/portalApiClient";

/** Abstracts the PostgreSQL query surface so related repository writes can share a transaction client. */
export type ServiceDeskQueryExecutor = PortalApiQueryExecutor;

/** Allows repository calls to use a caller-owned transaction instead of the shared pool. */
export type ServiceDeskRepositoryOptions = {
  query?: ServiceDeskQueryExecutor;
};
