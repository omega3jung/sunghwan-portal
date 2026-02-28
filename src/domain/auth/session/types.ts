import { AuthUser } from "../model";

// probably separated type in future.
export type JwtUserPayload = AuthUser;
export type SessionUser = Omit<AuthUser, "accessToken">;
