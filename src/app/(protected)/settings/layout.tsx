// app/(protected)/settings/layout.tsx

import { Separator } from "@radix-ui/react-select";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ReactNode } from "react";

import { resolveServiceDeskSettingsPrincipalFromSession } from "@/app/api/_adapters/serviceDesk";
import { authOptions } from "@/auth.config";
import { getServiceDeskAdminType } from "@/lib/application/serviceDesk";

import { SettingsAccessGuard, SettingsScopeProvider } from "./_providers";
import { SettingsNavigation } from "./components";

export default async function SettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // check session one more.
  if (!session?.user) redirect("/login");

  const principalContext = await resolveServiceDeskSettingsPrincipalFromSession(
    session,
  ).catch(() => null);

  if (
    !principalContext ||
    !getServiceDeskAdminType(principalContext.principal)
  ) {
    redirect("/");
  }

  const { principal } = principalContext;

  return (
    <SettingsAccessGuard>
      <SettingsScopeProvider
        userScope={principal.userScope}
        permission={principal.permission}
        companyId={principal.companyId}
      >
        <SettingsNavigation />
        <Separator className="my-2 h-1 rounded bg-border" />
        {children}
      </SettingsScopeProvider>
    </SettingsAccessGuard>
  );
}
