import { getServerSession } from "next-auth";

import { authOptions } from "@/auth.config";

export async function getEffectiveUser() {
  const session = await getServerSession(authOptions);

  // impersonation 정보도 서버 세션에 포함되어 있어야 함
  // e.g. session.impersonation?.subject

  return session!.user;
}
