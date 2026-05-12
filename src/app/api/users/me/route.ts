// app/api/me/route.ts
import { NextRequest, NextResponse } from "next/server";

import { getCurrentAppUser } from "@/server/auth/getCurrentAppUser";

export async function GET(req: NextRequest) {
  const user = await getCurrentAppUser(req);
  return NextResponse.json(user);
}
