// user type for authorization.
export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  access_token: string;
  roles: string[];
}
