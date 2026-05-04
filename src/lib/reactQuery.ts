/**
 * Defines shared query options for data that can remain stable for several minutes.
 *
 * Use for:
 * - Reusing consistent defaults for infrequently changing queries
 * - Avoiding unnecessary refetches for relatively static data sources
 *
 * @param none - This configuration object does not accept any arguments
 * @returns An object containing react-query options for static or slow-changing data
 */
export const STATIC_QUERY_OPTIONS = {
  staleTime: 5 * 60_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

/**
 * Defines shared query options for data that should refresh aggressively.
 *
 * Use for:
 * - Reusing consistent defaults for frequently changing queries
 * - Allowing refetches when the browser window regains focus
 *
 * @param none - This configuration object does not accept any arguments
 * @returns An object containing react-query options for dynamic or fast-changing data
 */
export const DYNAMIC_QUERY_OPTIONS = {
  staleTime: 0,
  refetchOnWindowFocus: true,
};
