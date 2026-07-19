import type { PortalApiQueryExecutor } from "@/server/shared/supabase/portalApiClient";

export type ServiceDeskQueryExecutor = PortalApiQueryExecutor;

export type ServiceDeskRepositoryOptions = {
  query?: ServiceDeskQueryExecutor;
};
