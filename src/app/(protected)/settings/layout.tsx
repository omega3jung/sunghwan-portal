// app/(protected)/settings/layout.tsx

import { Separator } from "@radix-ui/react-select";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ReactNode } from "react";

import { authOptions } from "@/auth.config";
import { ACCESS_LEVEL } from "@/domain/auth";
import { getCurrentAppUser } from "@/server/auth/getCurrentAppUser";

import { SettingsNavigation } from "./components";
import { SettingsScopeProvider } from "./SettingsScopeProvider";

export default async function SettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const currentUser = await getCurrentAppUser();

  // check session one more.
  if (!session?.user || !currentUser) redirect("/login");

  const { userScope, permission } = currentUser;
  const { dataScope } = session.user;

  // forbidden only when access to settings itself is not possible.
  if (permission < ACCESS_LEVEL.ADMIN) {
    redirect("/");
  }

  return (
    <SettingsScopeProvider
      dataScope={dataScope}
      userScope={userScope}
      permission={permission}
    >
      <SettingsNavigation />
      <Separator className="my-2 h-1 rounded bg-border" />
      {children}
    </SettingsScopeProvider>
  );
}
