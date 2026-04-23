import serviceDeskMessages from "@/lib/i18n/locales/en/serviceDesk.json";

type ServiceDeskMessageOptions = Record<string, unknown>;

function resolveMessage(key: string): string | undefined {
  const resolved = key
    .split(".")
    .reduce<unknown>((current, segment) => {
      if (!current || typeof current !== "object") {
        return undefined;
      }

      return (current as Record<string, unknown>)[segment];
    }, serviceDeskMessages);

  return typeof resolved === "string" ? resolved : undefined;
}

function interpolateMessage(
  template: string,
  options?: ServiceDeskMessageOptions,
) {
  if (!options) {
    return template;
  }

  return template.replace(/\{\{(\w+)\}\}/g, (_, token: string) => {
    const value = options[token];
    return value === undefined || value === null ? "" : String(value);
  });
}

export function tServiceDesk(
  key: string,
  options?: ServiceDeskMessageOptions,
) {
  const template = resolveMessage(key);

  if (typeof template !== "string") {
    return key;
  }

  return interpolateMessage(template, options);
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
    super(tServiceDesk(messageKey, options));
    this.name = "ServiceDeskApiError";
    this.status = status;
    this.messageKey = messageKey;
    this.options = options;
  }
}
