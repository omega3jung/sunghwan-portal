// app/(protected)/settings/layout.tsx

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { ReactNode } from "react";

import { resolveServiceDeskRequestContext } from "@/app/api/_adapters/serviceDesk";
import { authOptions } from "@/auth.config";
import { Separator } from "@/components/ui/separator";
import { getServiceDeskAdminType } from "@/lib/application/serviceDesk";

import { SettingsAccessGuard, SettingsAccessProvider } from "./_providers";
import { SettingsNavigation } from "./components";

export default async function SettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // check session one more.
  if (!session?.user) redirect("/login");

  const requestHeaders = new Headers(await headers());
  const request = new NextRequest(resolveRequestUrl(requestHeaders), {
    headers: requestHeaders,
  });
  const principalContext = await resolveServiceDeskRequestContext(
    request,
  ).catch(() => null);

  if (
    !principalContext ||
    !getServiceDeskAdminType(principalContext.principal)
  ) {
    redirect("/");
  }

  const { principal } = principalContext;

  return (
    <SettingsAccessProvider
      userScope={principal.userScope}
      permission={principal.permission}
      companyId={principal.companyId}
    >
      <SettingsAccessGuard>
        <SettingsNavigation />
        <Separator className="h-1 rounded" />
        {children}
      </SettingsAccessGuard>
    </SettingsAccessProvider>
  );
}

function resolveRequestUrl(requestHeaders: Headers) {
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost";

  return `${protocol}://${host}/settings`;
}
