// ✅ Dependencies were intentionally reduced.
// Function names were defined identically for easy future integration with lodash.

export const camelCase = (str: string): string =>
  str.replace(/_([a-z])/g, (_, char) => char.toUpperCase());

export const snakeCase = (str: string): string =>
  str
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "");

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
