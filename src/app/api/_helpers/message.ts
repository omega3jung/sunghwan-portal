type MessageOptions = Record<string, unknown>;

export const resolveMessageKey = (
  messages: unknown,
  key: string,
): string | undefined => {
  const resolved = key
    .split(".")
    .reduce<unknown>((current, segment) => {
      if (!current || typeof current !== "object") {
        return undefined;
      }

      return (current as Record<string, unknown>)[segment];
    }, messages);

  return typeof resolved === "string" ? resolved : undefined;
};

export const interpolateMessageTemplate = (
  template: string,
  options?: MessageOptions,
) => {
  if (!options) {
    return template;
  }

  return template.replace(/\{\{(\w+)\}\}/g, (_, token: string) => {
    const value = options[token];
    return value === undefined || value === null ? "" : String(value);
  });
};
