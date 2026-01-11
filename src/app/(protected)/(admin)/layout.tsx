// app/(protected)/(tenant-admin)/layout.tsx
import { redirect } from "next/navigation";
import { ReactNode } from "react";

import { getEffectiveUser } from "@/server/user/getEffectiveUser";
import { ACCESS_LEVEL } from "@/types";

export default async function TenantAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getEffectiveUser();

  if (user.userScope !== "INTERNAL" || user.permission < ACCESS_LEVEL.ADMIN) {
    redirect("/403");
  }

  return <>{children}</>;
}
