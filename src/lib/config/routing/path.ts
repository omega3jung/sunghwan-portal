import { ENVIRONMENT } from "../environment";

/**
 * Prefixes an absolute application path with the configured deployment base path.
 *
 * Use for:
 * - Generating links that work under a non-root deployment path
 * - Normalizing internal paths before routing or asset resolution
 *
 * @param path - The absolute path segment that must start with a leading slash
 * @returns The path prefixed with the configured application base path
 */
export const withBasePath = (path: string) => {
  if (!path.startsWith("/")) {
    throw new Error("withBasePath expects a leading slash");
  }

  return `${ENVIRONMENT.BASE_PATH}${path}`;
};

/**
 * Ensures that a path string starts with a leading slash.
 *
 * Use for:
 * - Normalizing route fragments before concatenation
 * - Preventing malformed internal URLs caused by missing slashes
 *
 * @param path - The path string to normalize
 * @returns The original path when it already starts with `/`, otherwise the same path with `/` prepended
 */
export const withLeadingSlash = (path: string) => {
  return path.startsWith("/") ? path : `/${path}`;
};
