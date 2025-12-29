// app/(protected)/providers.tsx
"use client";

import { ThemeProvider } from "next-themes";

import I18nProvider from "@/components/layout/I18nProvider/I18nProvider";
import { SidebarProvider } from "@/components/ui/sidebar";

// force-dynamic to block cache store.
//export const dynamic = "force-dynamic";
//export const revalidate = 0;

type Props = {
  children: React.ReactNode;
};

export function ProtectedProviders({ children }: Props) {
  // In the Protected area, server state and global settings must be initialized before the UI.
  // order : i18n > UI provider.

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nProvider namespaces={["common", "home"]}>
        <SidebarProvider className="ui-root relative">
          {children}
        </SidebarProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
