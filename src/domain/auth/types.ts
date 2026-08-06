export type LoginCredentials = {
  username: string;
  password: string;
} & Record<string, string>;

/** Separates internal provider users from client-tenant users. */
export type UserScope = "INTERNAL" | "CLIENT";
/** Selects LOCAL demo data or REMOTE persisted data for the authenticated session. */
export type DataScope = "LOCAL" | "REMOTE";
