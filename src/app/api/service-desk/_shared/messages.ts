import {
  interpolateMessageTemplate,
  resolveMessageKey,
} from "@/app/api/_helpers";
import serviceDeskMessages from "@/lib/i18n/locales/en/serviceDesk.json";

type ServiceDeskMessageOptions = Record<string, unknown>;

export function tServiceDeskApi(
  key: string,
  options?: ServiceDeskMessageOptions,
) {
  const template = resolveMessageKey(serviceDeskMessages, key);

  if (typeof template !== "string") {
    return key;
  }

  return interpolateMessageTemplate(template, options);
}

export class ServiceDeskApiError extends Error {
  readonly status: number;
  readonly messageKey: string;
  readonly options?: ServiceDeskMessageOptions;

  constructor(
    messageKey: string,
    status: number,
    options?: ServiceDeskMessageOptions,
  ) {
    super(tServiceDeskApi(messageKey, options));
    this.name = "ServiceDeskApiError";
    this.status = status;
    this.messageKey = messageKey;
    this.options = options;
  }
}
