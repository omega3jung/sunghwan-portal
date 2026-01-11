import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { startImpersonation, stopImpersonation } from "@/auth/impersonation";

import { tokenToAuthUser } from "../../_helpers";

export async function POST(req: NextRequest) {
  const token = await getToken({ req });

  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const actor = tokenToAuthUser(token);
  const { subjectId } = await req.json();

  const impersonation = await startImpersonation({
    actor,
    subjectId,
  });

  return NextResponse.json({
    impersonation, // { subjectId, activatedAt }
  });
}

export async function DELETE() {
  const impersonation = await stopImpersonation();

  // NextAuth session update trigger
  return NextResponse.json({
    impersonation,
  });
}
