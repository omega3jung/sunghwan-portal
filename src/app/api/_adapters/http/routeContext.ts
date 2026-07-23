export type RouteContext<
  TParams extends Record<string, string> = Record<string, string>,
> = {
  params: Promise<TParams>;
};

export type IdRouteContext = RouteContext<{ id: string }>;
export type TicketIdRouteContext = RouteContext<{ ticketId: string }>;
export type UserIdRouteContext = RouteContext<{ userId: string }>;
