import { useTranslation } from "react-i18next";

import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NS } from "@/lib/i18n";

type TicketFormDialogHeaderProps = {
  mode: "create" | "update" | "view";
};

export const TicketFormDialogHeader = ({
  mode,
}: TicketFormDialogHeaderProps) => {
  const { t } = useTranslation(NS.serviceDesk);

  if (mode === "view") {
    return null;
  }

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
