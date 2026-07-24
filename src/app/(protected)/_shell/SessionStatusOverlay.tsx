"use client";

import { useTranslation } from "react-i18next";

import { NS } from "@/lib/application/i18n";

type SessionStatusOverlayProps = {
  isDemoUser: boolean;
  isImpersonating: boolean;
};

export function SessionStatusOverlay({
  isDemoUser,
  isImpersonating,
}: SessionStatusOverlayProps) {
  if (isDemoUser && isImpersonating) {
    return <DemoImpersonationOverlay />;
  }

  if (isDemoUser) {
    return <DemoOverlay />;
  }

  if (isImpersonating) {
    return <ImpersonationOverlay />;
  }

  return null;
}

const DemoOverlay = () => {
  const { t } = useTranslation(NS.common);

  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-50 border-2 border-orange-400" />
      <div className="pointer-events-none absolute bottom-2 right-4 z-50 text-xl font-bold text-orange-400">
        {t("overlay.demo")}
      </div>
    </>
  );
};

const ImpersonationOverlay = () => {
  const { t } = useTranslation(NS.common);

  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-50 border-2 border-[#4281EB]" />
      <div className="pointer-events-none absolute bottom-2 right-4 z-50 text-xl font-bold text-[#4281EB]">
        {t("overlay.impersonation")}
      </div>
    </>
  );
};

const DemoImpersonationOverlay = () => {
  const { t } = useTranslation(NS.common);

  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-50 border-y-2 border-[#4281EB]" />
      <div className="pointer-events-none absolute inset-0 z-50 border-x-2 border-orange-400" />
      <div className="pointer-events-none absolute bottom-2 right-4 z-50 text-xl font-bold">
        <span className="text-orange-400">{`${t("overlay.demo")} · `}</span>
        <span className="text-[#4281EB]">{t("overlay.impersonation")}</span>
      </div>
    </>
  );
};
