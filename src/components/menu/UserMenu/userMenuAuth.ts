import { signOut } from "next-auth/react";

import { withBasePath } from "@/lib/config/routing";

/** Ends the session with a stable home callback rather than the current route. */
export const signOutToHome = () =>
  signOut({ callbackUrl: withBasePath("/") });
