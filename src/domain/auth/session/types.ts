import { AuthUser } from "../model";

// probably separated type in future.
export type JwtUserPayload = AuthUser;
/** Session-safe authentication projection that omits the backend access token. */
export type SessionUser = Omit<AuthUser, "accessToken">;
