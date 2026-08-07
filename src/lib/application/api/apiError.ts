/** Parameters that configure API error message behavior in shared application APIs. */
export type ApiErrorMessageOptions = Record<string, unknown>;

/**
 * Application-layer error contract carried across route and runtime adapters.
 *
 * `messageKey` and interpolation options keep LOCAL and REMOTE failures aligned
 * with the same locale catalog, while `status` preserves HTTP semantics without
 * coupling lower-level policies to `NextResponse`.
 */
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
