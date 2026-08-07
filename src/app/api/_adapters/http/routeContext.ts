/** Models the asynchronous dynamic parameters supplied to a Next.js route handler. */
export type RouteContext<
  TParams extends Record<string, string> = Record<string, string>,
> = {
  params: Promise<TParams>;
};

/** Provides the conventional dynamic id parameter to a route handler. */
export type IdRouteContext = RouteContext<{ id: string }>;
/** Provides a dynamic ticket identifier to nested Service Desk route handlers. */
export type TicketIdRouteContext = RouteContext<{ ticketId: string }>;
/** Provides a dynamic user identifier to user-scoped route handlers. */
export type UserIdRouteContext = RouteContext<{ userId: string }>;
