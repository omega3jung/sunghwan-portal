// Dependencies were intentionally reduced.
// Function names were kept aligned with lodash for easier future replacement.

/**
 * Converts a snake_case string to camelCase.
 *
 * Use for:
 * - Renaming API field names for client-side objects
 * - Normalizing manually entered keys to match JavaScript naming conventions
 *
 * @param str - The string containing underscore-delimited segments to convert
 * @returns A camelCase version of the input string
 *
 * @example
 * camelCase("ticket_status");
 * // "ticketStatus"
 */
export const camelCase = (str: string): string =>
  str.replace(/_([a-z])/g, (_, char) => char.toUpperCase());

/**
 * Converts a camelCase or PascalCase string to snake_case.
 *
 * Use for:
 * - Preparing client-side keys for API payloads
 * - Normalizing object property names for backend conventions
 *
 * @param str - The string containing uppercase word boundaries to convert
 * @returns A lowercase snake_case version of the input string
 *
 * @example
 * snakeCase("ticketStatus");
 * // "ticket_status"
 */
export const snakeCase = (str: string): string =>
  str
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "");

/**
 * Recursively converts every object key in a value tree to snake_case.
 *
 * Use for:
 * - Transforming nested request payloads before sending them to an API
 * - Normalizing mixed object and array structures to backend key naming rules
 *
 * @param obj - The value tree whose object keys should be converted recursively
 * @returns A value with the same shape where every object key uses snake_case
 *
 * @example
 * mapKeysToSnakeCase({ ticketInfo: { ownerName: "Kim" } });
 * // { ticket_info: { owner_name: "Kim" } }
 */
export const mapKeysToSnakeCase = <T>(obj: T): T => {
  if (Array.isArray(obj)) {
    return obj.map(mapKeysToSnakeCase) as T;
  }

  if (obj !== null && typeof obj === "object") {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      acc[snakeCase(key)] = mapKeysToSnakeCase(value);
      return acc;
    }, {} as any);
  }

  return obj;
};

/**
 * Recursively converts every object key in a value tree to camelCase.
 *
 * Use for:
 * - Mapping nested API responses to client-side naming conventions
 * - Normalizing mixed object and array structures after deserialization
 *
 * @param obj - The value tree whose object keys should be converted recursively
 * @returns A value with the same shape where every object key uses camelCase
 *
 * @example
 * mapKeysToCamelCase({ ticket_info: { owner_name: "Kim" } });
 * // { ticketInfo: { ownerName: "Kim" } }
 */
export const mapKeysToCamelCase = <T>(obj: T): T => {
  if (Array.isArray(obj)) {
    return obj.map(mapKeysToCamelCase) as T;
  }

  if (obj !== null && typeof obj === "object") {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      acc[camelCase(key)] = mapKeysToCamelCase(value);
      return acc;
    }, {} as any);
  }

  return obj;
};
