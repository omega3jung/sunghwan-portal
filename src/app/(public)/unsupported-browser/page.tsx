// app/(public)/unsupported-browser/page.tsx
"use client";

import { useTranslation } from "react-i18next";

export default function UnsupportedBrowserPage() {
  const { t } = useTranslation("unsupportedBrowser");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>
      <p className="text-gray-600 text-center max-w-md">
        {t("description")}
        <br />
        {t("browserRecommendation")}
      </p>
    </div>
  );
}
