/**
 * Extracts initials from a name and preserves visible characters for CJK names.
 *
 * Use for:
 * - Building avatar fallbacks from display names
 * - Generating short labels for users when no profile image exists
 *
 * @param name - The raw name string to convert into initials
 * @param maxLength - The maximum number of characters to include in the result
 * @returns A trimmed initials string, or an empty string when the name is blank
 *
 * @example
 * initials("Jane Doe");
 * // "JD"
 */
export const initials = (name: string, maxLength = 2) => {
  if (!name) {
    return "";
  }

  const trimmed = name.trim();
  if (!trimmed) return "";

  // Keep the first visible characters for CJK names instead of splitting by spaces.
  const cjkRegex = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/;
  if (cjkRegex.test(trimmed)) {
    return [...trimmed].slice(0, maxLength).join("");
  }

  try {
    return trimmed
      .replace(/[^a-zA-ZÀ-ÿ ]/g, "")
      .split(/\s+/)
      .map((word) => word[0]?.toUpperCase())
      .filter(Boolean)
      .join("")
      .slice(0, maxLength);
  } catch {
    return name[0].slice(0, maxLength);
  }
};
