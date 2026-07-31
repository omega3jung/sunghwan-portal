"use client";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { NS } from "@/lib/application/i18n";

export function useConfirmDiscardChanges(hasUnsavedChanges: boolean) {
  const { t } = useTranslation(NS.settings);

  return useCallback(() => {
    if (!hasUnsavedChanges) {
      return true;
    }

    return window.confirm(
      t("serviceDeskSettings.common.discardUnsavedChanges", {
        defaultValue:
          "You have unsaved changes. Discard them and continue?",
      }),
    );
  }, [hasUnsavedChanges, t]);
}
