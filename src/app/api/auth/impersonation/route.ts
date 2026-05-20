import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";

import { isAdmin, tokenToOriginalAuthUser } from "@/app/api/_helpers";
import { startImpersonation, stopImpersonation } from "@/auth/impersonation";

export async function POST(req: NextRequest) {
  const token = await getToken({ req });

  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdmin(token)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const originalUser = tokenToOriginalAuthUser(token);
  const schema = z.object({
    impersonatedUsername: z.string().trim().min(1),
  });

  const { impersonatedUsername } = schema.parse(await req.json());

  const impersonation = await startImpersonation({
    originalUser,
    impersonatedUsername,
  });

  return NextResponse.json({
    impersonation,
  });
}

export async function DELETE(req: NextRequest) {
  const token = await getToken({ req });

  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdmin(token)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const impersonation = await stopImpersonation();

  // NextAuth session update trigger
  return NextResponse.json({
    impersonation,
  });
}
