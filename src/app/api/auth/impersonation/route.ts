import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";

import { tokenToOriginalAuthUser } from "@/app/api/_helpers";
import { startImpersonation, stopImpersonation } from "@/auth/impersonation";

export async function POST(req: NextRequest) {
  const token = await getToken({ req });

  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const originalUser = tokenToOriginalAuthUser(token);
  const schema = z.object({
    impersonatedUserId: z.uuid(),
  });

  const { impersonatedUserId } = schema.parse(await req.json());

  const impersonation = await startImpersonation({
    originalUser,
    impersonatedUserId,
  });

  return NextResponse.json({
    impersonation,
  });
}

export async function DELETE() {
  const impersonation = await stopImpersonation();

  // NextAuth session update trigger
  return NextResponse.json({
    impersonation,
  });
}
