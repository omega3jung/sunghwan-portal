import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function isRemoteRequest(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  return token?.dataScope === "REMOTE";
}
