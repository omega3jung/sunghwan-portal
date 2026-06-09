import type { NextResponse } from "next/server";

import {
  createNotFoundResponse,
  ServiceDeskPortalApiContext,
} from "./serviceDeskPortalApiShared";

export async function handleTicketActionPortalApi(
  _context: ServiceDeskPortalApiContext,
): Promise<NextResponse> {
  return createNotFoundResponse();
}
