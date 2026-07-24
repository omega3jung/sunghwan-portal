export type ApiErrorMessageOptions = Record<string, unknown>;

export class ApiError extends Error {
  readonly status: number;
  readonly messageKey: string;
  readonly options?: ApiErrorMessageOptions;

  constructor(
    messageKey: string,
    status: number,
    options?: ApiErrorMessageOptions,
  ) {
    super(messageKey);
    this.name = "ApiError";
    this.status = status;
    this.messageKey = messageKey;
    this.options = options;
  }
}
