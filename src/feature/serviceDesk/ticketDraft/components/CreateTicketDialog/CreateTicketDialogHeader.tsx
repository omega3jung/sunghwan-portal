import { useTranslation } from "react-i18next";

import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NS } from "@/lib/application/i18n";

export const CreateTicketDialogHeader = () => {
  const { t } = useTranslation(NS.serviceDesk);

  return (
    <DialogHeader className="px-4 py-3 md:px-6 md:py-4">
      <DialogTitle className="max-w-full break-words text-center">
        {t("action.withItem", {
          ns: NS.common,
          action: t("action.create", { ns: NS.common }),
          item: t("field.ticket", { ns: NS.common }),
        })}
      </DialogTitle>
    </DialogHeader>
  );
};
