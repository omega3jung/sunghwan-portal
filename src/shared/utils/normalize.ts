/**
 * Replaces `undefined` values with `null` for a selected set of object keys.
 *
 * Use for:
 * - Normalizing form values before sending nullable fields to an API
 * - Ensuring specific object properties are explicitly null instead of omitted
 *
 * @param source - The source object to copy and normalize
 * @param keys - The keys that should become `null` when their current value is `undefined`
 * @returns A copied object where the specified keys never remain `undefined`
 *
 * @example
 * normalizeNullable({ title: "A", assigneeId: undefined }, ["assigneeId"] as const);
 * // { title: "A", assigneeId: null }
 */
export function normalizeNullable<
  T extends object,
  K extends readonly (keyof T)[],
>(
  source: T,
  keys: K,
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
