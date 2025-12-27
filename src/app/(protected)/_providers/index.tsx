// app/(protected)/providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import I18nProvider from "@/components/layout/I18nProvider/I18nProvider";
import { SidebarProvider } from "@/components/ui/sidebar";

import { AppUserProvider } from "./AppUserProvider";

// force-dynamic to block cache store.
//export const dynamic = "force-dynamic";
//export const revalidate = 0;

type Props = {
  children: React.ReactNode;
};

export function ProtectedProviders({ children }: Props) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 60 * 1 sec = 1 min.
            retry: 1,
          },
        },
      })
  );

  // In the Protected area, server state and global settings must be initialized before the UI.
  // order : QueryClient > i18n > UI provider.

  return (
    <QueryClientProvider client={queryClient}>
      <AppUserProvider>
        <I18nProvider namespaces={["common", "home"]}>
          <SidebarProvider className="ui-root relative">
            {children}
          </SidebarProvider>
        </I18nProvider>
      </AppUserProvider>
    </QueryClientProvider>
  );
}
