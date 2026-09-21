import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getAuthToken, tokenToOriginalAuthUser } from "@/app/api/_adapters";
import { resolveAuthorizedImpersonation } from "@/auth/impersonation";

const requestSchema = z.object({
  impersonatedUsername: z.string().trim().min(1),
});

/** Handles POST /api/auth/impersonation using the same policy as the JWT callback. */
export async function POST(req: NextRequest) {
  const token = await getAuthToken(req);
  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { impersonatedUsername } = requestSchema.parse(await req.json());
    const impersonation = await resolveAuthorizedImpersonation(
      tokenToOriginalAuthUser(token),
      impersonatedUsername,
    );
    return NextResponse.json({ impersonation });
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
    }
    if (
      error instanceof Error &&
      "status" in error &&
      typeof error.status === "number"
    ) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/** Stopping impersonation requires authentication; the JWT callback clears the metadata. */
export async function DELETE(req: NextRequest) {
  const token = await getAuthToken(req);
  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ impersonation: null });
}
