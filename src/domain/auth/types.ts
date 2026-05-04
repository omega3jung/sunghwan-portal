export type LoginCredentials = {
  username: string;
  password: string;
} & Record<string, string>;

export type UserScope = "INTERNAL" | "CLIENT";
export type DataScope = "LOCAL" | "REMOTE";
