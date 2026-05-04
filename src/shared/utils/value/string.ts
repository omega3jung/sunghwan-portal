/**
 * Checks whether a value is a string primitive or a `String` object.
 *
 * Use for:
 * - Guarding dynamic values before string-specific operations
 * - Interpreting loose data structures that may wrap strings as objects
 *
 * @param data - The unknown value to test
 * @returns `true` when the value is a string-like value, otherwise `false`
 */
export const isString = (data: any) => {
  return (
    typeof data == "string" ||
    (typeof data == "object" && data.constructor === String)
  );
};

/**
 * Checks whether a value can be parsed successfully by `JSON.parse`.
 *
 * Use for:
 * - Detecting serialized JSON payloads in string fields
 * - Guarding deserialization before attempting to parse stored values
 *
 * @param obj - The raw value to attempt to parse as JSON
 * @returns `true` when parsing succeeds, otherwise `false`
 */
export const isJson = (obj: any) => {
  try {
    JSON.parse(obj);
  } catch (e) {
    return false;
  }

  return true;
};

/**
 * Checks whether a string matches the application's checkbox state markers.
 *
 * Use for:
 * - Interpreting checked-state values from value-label pairs
 * - Validating checkbox-like strings before converting them to numeric flags
 *
 * @param value - The string value to compare against supported checkbox markers
 * @returns `true` when the value is `"checked"` or `"unchecked"`, otherwise `false`
 */
export const isChecked = (value: string) => {
  return value === "checked" || value === "unchecked";
};

/**
 * Checks whether a value represents a boolean when converted to a string.
 *
 * Use for:
 * - Detecting boolean-like values in serialized form data
 * - Guarding string-to-boolean conversion in loose input structures
 *
 * @param bool - The value to inspect as a potential boolean string
 * @returns `true` when the value stringifies to `"true"` or `"false"`, otherwise `false`
 */
export const isBoolean = (bool: any) => {
  const isBool = String(bool) === "true" || String(bool) === "false";

  return isBool;
};
