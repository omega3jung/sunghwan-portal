// server/user/getEffectiveUser.ts
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth.config";

export async function getEffectiveUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return session.user;
}
