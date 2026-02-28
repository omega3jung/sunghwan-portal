export const ACCESS_LEVEL = {
  ADMIN: 9,
  MANAGER: 7,
  LEADER: 5,
  USER: 3,
  GUEST: 1,
  // 8, 6, 4, 2 reserved.
  // 0 = no permission.
} as const;

export type Role = keyof typeof ACCESS_LEVEL;
export type AccessLevel = (typeof ACCESS_LEVEL)[Role];
