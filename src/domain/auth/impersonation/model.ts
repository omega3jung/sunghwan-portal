interface UserInfo {
  id: string;
  username: string;
}

/** Represents impersonation info within the authentication domain. */
export interface ImpersonationInfo {
  originalUser: UserInfo;
  impersonatedUser: UserInfo;
  activatedAt: number;
}
