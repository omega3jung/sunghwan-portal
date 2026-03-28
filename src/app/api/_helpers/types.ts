// src/app/api/_helpers/types.ts

export type RouteContext<
  TParams extends Record<string, string> = Record<string, string>,
> = {
  params: TParams;
};

export type IdRouteContext = RouteContext<{ id: string }>;
export type TicketIdRouteContext = RouteContext<{ ticketId: string }>;
export type UserIdRouteContext = RouteContext<{ userId: string }>;
