import { AuthUser } from "../model";

export type JwtUserPayload = AuthUser;
/** Session-safe authentication projection that omits the backend access token. */
export type SessionUser = Omit<AuthUser, "accessToken">;
