import {
  interpolateMessageTemplate,
  resolveMessageKey,
} from "@/lib/application/i18n";
import errorMessages from "@/lib/application/i18n/locales/en/error.json";

import type { ApiErrorMessageOptions } from "./apiError";

export function resolveApiErrorMessage(
  key: string,
  options?: ApiErrorMessageOptions,
) {
  const template = resolveMessageKey(errorMessages, key);

  return typeof template === "string"
    ? interpolateMessageTemplate(template, options)
    : key;
}
