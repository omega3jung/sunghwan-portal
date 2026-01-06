// app/(protected)/settings/layout.tsx

import { ReactNode } from "react";

import { SettingsNavigation } from "./components";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SettingsNavigation />
      {children}
    </>
  );
}
