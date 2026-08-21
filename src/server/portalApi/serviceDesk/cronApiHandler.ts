import { NextResponse } from "next/server";

import { closeExpiredResolvedTickets } from "@/server/data/serviceDesk/ticket";

import {
  createNotFoundResponse,
  type ServiceDeskPortalApiContext,
} from "./serviceDeskPortalApiUtils";

const CLOSE_EXPIRED_RESOLVED_TICKETS_PATH_PATTERN =
  /^\/service-desk\/cron\/tickets\/close-expired-resolved$/;

/** Routes trusted Service Desk system automation requests to their owning domain services. */
export async function handleCronPortalApi(
  context: ServiceDeskPortalApiContext,
) {
  if (
    context.method !== "POST" ||
    !CLOSE_EXPIRED_RESOLVED_TICKETS_PATH_PATTERN.test(context.path)
  ) {
    return createNotFoundResponse();
  }

  return NextResponse.json(await closeExpiredResolvedTickets());
}
