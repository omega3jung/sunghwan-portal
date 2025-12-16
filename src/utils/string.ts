/** Get initial of name */
export const initials = (name: string | undefined) => {
  if (!name) {
    return "";
  }

  try {
    return name
      .replace(/[^a-zA-Z ]/g, "")
      .split(" ")
      .map((word) => (word.length > 0 ? word[0].toUpperCase() : word))
      .join("")
      .slice(0, 2);
  } catch (e) {
    return name[0].toUpperCase();
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
