// app/(public)/login/layout.tsx

import { ReactNode } from "react";

import I18nProvider from "@/components/layout/I18nProvider/I18nProvider";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <I18nProvider namespaces={["common", "login"]}>{children}</I18nProvider>
  );
}
