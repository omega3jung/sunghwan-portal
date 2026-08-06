interface UserInfo {
  id: string;
  username: string;
}

export interface ImpersonationInfo {
  originalUser: UserInfo;
  impersonatedUser: UserInfo;
  activatedAt: number;
}
