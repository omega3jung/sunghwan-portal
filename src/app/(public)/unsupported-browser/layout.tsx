// app/(public)/unsupported-browser/layout.tsx

import I18nProvider from "@/components/layout/I18nProvider/I18nProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider namespaces={["common", "unsupportedBrowser"]}>
      {children}
    </I18nProvider>
  );
}
