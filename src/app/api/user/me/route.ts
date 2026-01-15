// app/api/me/route.ts
import { NextResponse } from "next/server";

import { getAppUser } from "@/server/auth/getAppUser";

export async function GET() {
  // real backend
  const user = await getAppUser();
  return NextResponse.json(user);
}
