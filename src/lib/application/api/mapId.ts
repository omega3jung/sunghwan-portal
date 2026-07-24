// number | null → string | undefined
export const numberToId = (value: number | null): string | undefined => {
  return value === null ? undefined : String(value);
};

// string | undefined → number | null
export const idToNumber = (value: string | undefined): number | null => {
  if (value === undefined) return null;

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};
