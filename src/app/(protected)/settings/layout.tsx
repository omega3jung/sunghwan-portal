// app/(protected)/settings/layout.tsx

import { Separator } from "@radix-ui/react-select";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

import { getEffectiveUser } from "@/server/user";
import { ACCESS_LEVEL } from "@/types";

import { SettingsNavigation } from "./components";
import { SettingsScopeProvider } from "./SettingsScopeProvider";

export default async function SettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getEffectiveUser();

  // check session one more.
  if (!session) redirect("/login");

  const { dataScope, userScope, permission } = session;

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
