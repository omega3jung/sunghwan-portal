import type { NextResponse } from "next/server";

import {
  createNotFoundResponse,
  ServiceDeskPortalApiContext,
} from "./serviceDeskPortalApiShared";

export async function handleWorkSessionPortalApi(
  _context: ServiceDeskPortalApiContext,
): Promise<NextResponse> {
  return createNotFoundResponse();
}
