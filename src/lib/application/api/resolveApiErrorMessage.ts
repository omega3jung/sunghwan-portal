import {
  interpolateMessageTemplate,
  resolveMessageKey,
} from "@/lib/application/i18n";
import errorMessages from "@/lib/application/i18n/locales/en/error";

import type { ApiErrorMessageOptions } from "./apiError";

/**
 * Resolves an application error key against the stable English server fallback.
 * Unknown keys are returned unchanged so an error remains diagnosable even when
 * the locale catalog is incomplete.
 */
export function resolveApiErrorMessage(
  key: string,
  options?: ApiErrorMessageOptions,
) {
  const template = resolveMessageKey(errorMessages, key);

  return typeof template === "string"
    ? interpolateMessageTemplate(template, options)
    : key;
}
