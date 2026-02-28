export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  IT_SERVICE_DESK: "/it-service-desk",
  DEMO: "/demo",
  SETTINGS: "/settings",
} as const;

export const PUBLIC_ROUTES = [ROUTES.LOGIN];

export const isPublicRoute = (pathname: string) =>
  PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
