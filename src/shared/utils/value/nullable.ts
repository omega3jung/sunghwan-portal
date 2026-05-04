/**
 * Converts a `null` value to `undefined` while leaving every other value unchanged.
 *
 * Use for:
 * - Adapting API values to optional form fields
 * - Removing explicit nulls before passing props that expect `undefined`
 *
 * @param value - The value that may be `null`
 * @returns `undefined` when the input is `null`, otherwise the original value
 */
export const nullToUndefined = <T>(value: T | null): T | undefined => {
  return value === null ? undefined : value;
};

/**
 * Converts an `undefined` value to `null` while leaving every other value unchanged.
 *
 * Use for:
 * - Preparing optional values for APIs that require explicit nulls
 * - Normalizing missing fields before persistence
 *
 * @param value - The value that may be `undefined`
 * @returns `null` when the input is `undefined`, otherwise the original value
 */
export const undefinedToNull = <T>(value: T | undefined): T | null => {
  return value === undefined ? null : value;
};
