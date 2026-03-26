import { ValueLabel } from "@/shared/types";

import { isNumber } from "./number";
import { isBoolean, isChecked, isJson, isString } from "./string";

/**
 * Converts value-label pairs into an object while inferring primitive value types from each entry.
 *
 * Use for:
 * - Translating dynamic form metadata into a typed object payload
 * - Reconstructing primitive values from string-based label/value collections
 *
 * @param data - The list of label/value entries to convert into an object
 * @returns An object keyed by each label with values converted to numbers, booleans, strings, or parsed JSON when applicable
 *
 * @example
 * valueLabelToObject([{ label: "count", value: "3" }]);
 * // { count: 3 }
 */
export const valueLabelToObject = <T>(data: ValueLabel[]): T => {
  const obj: Record<string, any> = {};

  for (const dt of data) {
    if (isNumber(dt.value)) {
      obj[dt.label] = Number(dt.value);
      continue;
    }

    if (isChecked(dt.value)) {
      obj[dt.label] = +(dt.value === "checked");
      continue;
    }

    if (isString(dt.value)) {
      obj[dt.label] = String(dt.value);
      continue;
    }

    if (isJson(dt.value)) {
      obj[dt.label] = JSON.parse(dt.value);
      continue;
    }

    if (isBoolean(dt.value)) {
      obj[dt.label] = dt.value === "true";
    }
  }

  return obj as T;
};
