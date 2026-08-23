interface OriginalUserInfo {
  id: string;
  username: string;
}

interface ImpersonatedUserInfo {
  username: string;
}

export interface ImpersonationInfo {
  originalUser: OriginalUserInfo;
  impersonatedUser: ImpersonatedUserInfo;
  activatedAt: number;
}
