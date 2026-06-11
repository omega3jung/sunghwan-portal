import type { NextResponse } from "next/server";

import {
  createNotFoundResponse,
  ServiceDeskPortalApiContext,
} from "./serviceDeskPortalApiUtils";

export async function handleTicketPortalApi(
  _context: ServiceDeskPortalApiContext,
): Promise<NextResponse> {
  return createNotFoundResponse();
}
