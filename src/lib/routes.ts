/**
 * Defines the shared route path constants used across the application.
 *
 * Use for:
 * - Reusing canonical route strings in navigation and guards
 * - Avoiding duplicated hard-coded path values in features and layouts
 *
 * @param none - This configuration object does not accept any arguments
 * @returns An immutable object containing the application's named route paths
 */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SERVICE_DESK: "/service-desk",
  DEMO: "/demo",
  SETTINGS: "/settings",
} as const;

/**
 * Lists the routes that can be accessed without authentication.
 *
 * Use for:
 * - Reusing public route checks in middleware and layout code
 * - Grouping paths that should bypass auth guards
 *
 * @param none - This configuration object does not accept any arguments
 * @returns An array containing route paths that should be treated as public
 */
export const PUBLIC_ROUTES = [ROUTES.LOGIN];

/**
 * Checks whether a pathname matches one of the routes that can be accessed without authentication.
 *
 * Use for:
 * - Guarding protected routes in middleware or layout logic
 * - Allowing nested public pages under a known public route prefix
 *
 * @param pathname - The current pathname to test against the public route list
 * @returns `true` when the pathname is public or nested under a public route, otherwise `false`
 */
export const isPublicRoute = (pathname: string) =>
  PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
