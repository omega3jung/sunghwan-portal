/** Numeric authorization thresholds keyed by application role. */
export const ACCESS_LEVEL = {
  ADMIN: 9,
  MANAGER: 7,
  LEADER: 5,
  USER: 3,
  GUEST: 1,
  NONE: 0, // no permission
  // 8, 6, 4, 2 reserved.
} as const;

/** Represents role within the authentication domain. */
export type Role = keyof typeof ACCESS_LEVEL;
/** Represents access level within the authentication domain. */
export type AccessLevel = (typeof ACCESS_LEVEL)[Role];
