// server/auth/getEffectiveUser.ts
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth.config";

export async function getEffectiveUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}
