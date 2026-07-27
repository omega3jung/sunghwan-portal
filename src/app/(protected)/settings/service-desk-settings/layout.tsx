import type { ReactNode } from "react";

import { ServiceDeskSettingsTenantSelectionProvider } from "./ServiceDeskSettingsTenantSelectionProvider";

export default function ServiceDeskSettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="settings-main p-4">
      <ServiceDeskSettingsTenantSelectionProvider>
        {children}
      </ServiceDeskSettingsTenantSelectionProvider>
    </main>
  );
}
