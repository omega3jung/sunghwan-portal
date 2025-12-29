import { ValueLabel } from "@/types/common";

import { isNumber } from "./number";
import { isBoolean, isChecked, isJson, isString } from "./string";

export const mapValueLabelToType = <T>(data: ValueLabel[]): T => {
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
