import { DbTicketDetail } from "@/lib/application/contracts/serviceDesk";

export function resolveTicketYear(
  tickets: DbTicketDetail[],
  nowIso: string,
): number {
  const years = tickets
    .map((ticket) => ticket.ticket_number.match(/^[A-Z]+-(\d{4})-\d+$/)?.[1])
    .filter((year): year is string => Boolean(year))
    .map((year) => Number(year))
    .filter((year) => Number.isFinite(year));

  if (years.length === 0) {
    return new Date(nowIso).getUTCFullYear();
  }

  return Math.max(...years);
}

export function resolveNextTicketSequence(
  tickets: DbTicketDetail[],
  year: number,
): number {
  const yearToken = String(year);
  const numbers = tickets
    .map((ticket) => {
      const matched = ticket.ticket_number.match(/^[A-Z]+-(\d{4})-(\d+)$/);

      if (!matched || matched[1] !== yearToken) {
        return null;
      }

      return Number(matched[2]);
    })
    .filter((value): value is number => Number.isFinite(value));

  return (numbers.length ? Math.max(...numbers) : 0) + 1;
}

export function createTicketId(year: number, sequence: number) {
  return `sunghwan-portal-${year}-${sequence}`;
}

export function createTicketNumber(year: number, sequence: number) {
  return `SP-${year}-${String(sequence).padStart(4, "0")}`;
}
