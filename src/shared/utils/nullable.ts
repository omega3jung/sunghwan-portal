export const nullToUndefined = <T>(value: T | null): T | undefined => {
  return value === null ? undefined : value;
};

export const undefinedToNull = <T>(value: T | undefined): T | null => {
  return value === undefined ? null : value;
};
