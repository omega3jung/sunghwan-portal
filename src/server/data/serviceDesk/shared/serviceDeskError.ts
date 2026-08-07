/** Carries an HTTP-compatible status code through Service Desk business failures. */
export type ServiceDeskStatusError = Error & { status: number };

/** Creates a Service Desk error whose status can be translated at the API boundary. */
export function createServiceDeskStatusError(
  message: string,
  status: number,
): ServiceDeskStatusError {
  return Object.assign(new Error(message), { status });
}
