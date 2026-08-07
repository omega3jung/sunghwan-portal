"use client";

import type { ReactNode } from "react";
import { I18nextProvider } from "react-i18next";

import { SidebarProvider } from "@/components/ui/sidebar";
import i18n from "@/lib/client/i18n/runtime";

type Props = {
  children: ReactNode;
};

export function ProtectedProviders({ children }: Props) {
  // In the Protected area, server state and global settings must be initialized before the UI.
  // order : i18n > UI provider.

  return (
    <I18nextProvider i18n={i18n}>
      <SidebarProvider className="ui-root relative">
        {children}
      </SidebarProvider>
    </I18nextProvider>
  );
}
