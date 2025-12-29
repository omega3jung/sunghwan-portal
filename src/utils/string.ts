/** Get initial of name */
export const initials = (name: string, maxLength = 2) => {
  if (!name) {
    return "";
  }

  const trimmed = name.trim();
  if (!trimmed) return "";

  // 1️⃣ CJK (Chinese, Japanese, Korean)
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
  } catch (e) {
    return name[0].slice(0, maxLength);
  }
};

export const isString = (data: any) => {
  return (
    typeof data == "string" ||
    (typeof data == "object" && data.constructor === String)
  );
};

export const isJson = (obj: any) => {
  try {
    JSON.parse(obj);
  } catch (e) {
    return false;
  }

  return true;
};

export const isChecked = (value: string) => {
  return value === "checked" || value === "unchecked";
};

export const isBoolean = (bool: any) => {
  const isBool = String(bool) === "true" || String(bool) === "false";

  return isBool;
};
