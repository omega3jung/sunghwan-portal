import { NextRequest, NextResponse } from "next/server";

import {
  type AuthFailure,
  checkAdmin,
  checkAdminOrSelf,
} from "./requestAuth";

/** Converts a failed authentication or authorization result to the shared JSON response contract. */
export function toAuthErrorResponse(auth: AuthFailure) {
  return NextResponse.json(
    { message: auth.status === 401 ? "Unauthorized" : "Forbidden" },
    { status: auth.status },
  );
}

/** Returns a stable HTTP error response when the request is not authorized as an administrator. */
export async function getAdminErrorResponse(request: NextRequest) {
  const auth = await checkAdmin(request);

  if (auth.ok) {
    return null;
  }

  return toAuthErrorResponse(auth);
}

/** Returns a stable HTTP error response when a user-scoped request is neither self nor administrator. */
export async function getAdminOrSelfErrorResponse(
  request: NextRequest,
  targetUserId: string,
) {
  const auth = await checkAdminOrSelf(request, targetUserId);

  if (auth.ok) {
    return null;
  }

  return toAuthErrorResponse(auth);
}
