/**
 * Mock/local demo clone helper.
 *
 * This intentionally uses JSON serialization because the current local demo
 * stores only plain JSON-like data. It should not be used for values that
 * contain Dates, Maps, Sets, class instances, functions, or circular refs.
 */
export const cloneLocalStore = <T>(value: T): T => {
  return JSON.parse(JSON.stringify(value)) as T;
};
