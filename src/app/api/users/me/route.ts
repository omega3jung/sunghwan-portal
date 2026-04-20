// app/api/me/route.ts
import { NextResponse } from "next/server";

import { getCurrentAppUser } from "@/server/auth/getCurrentAppUser";

export async function GET() {
  const user = await getCurrentAppUser();
  return NextResponse.json(user);
}
