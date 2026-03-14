export const STATIC_QUERY_OPTIONS = {
  staleTime: 5 * 60_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

export const DYNAMIC_QUERY_OPTIONS = {
  staleTime: 0,
  refetchOnWindowFocus: true,
};
