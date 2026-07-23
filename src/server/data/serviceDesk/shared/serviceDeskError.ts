export type ServiceDeskStatusError = Error & { status: number };

export function createServiceDeskStatusError(
  message: string,
  status: number,
): ServiceDeskStatusError {
  return Object.assign(new Error(message), { status });
}
