// src/utils/normalize.ts
export function normalizeNullable<
  T extends object,
  K extends readonly (keyof T)[]
>(
  source: T,
  keys: K
): {
  [P in keyof T]: P extends K[number] ? T[P] | null : T[P];
} {
  const result = { ...source } as any;

  keys.forEach((key) => {
    if (result[key] === undefined) {
      result[key] = null;
    }
  });

  return result;
}
