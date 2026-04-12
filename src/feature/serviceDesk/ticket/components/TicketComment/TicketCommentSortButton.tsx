import { ArrowDown01, ArrowDown10 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { NS } from "@/lib/i18n";

type TicketCommentSortButtonProps = {
  sortOrder: "desc" | "asc";
  onClick: () => void;
};

export function TicketCommentSortButton({
  sortOrder,
  onClick,
}: TicketCommentSortButtonProps) {
  const { t } = useTranslation(NS.serviceDesk);

  return (
    <Button
      type="button"
      variant="outline"
      className="shrink-0 justify-between gap-2"
      onClick={onClick}
    >
      {sortOrder === "desc" ? (
        <ArrowDown10 className="h-4 w-4" />
      ) : (
        <ArrowDown01 className="h-4 w-4" />
      )}
      {sortOrder === "desc"
        ? t("sort.latest", { ns: NS.common })
        : t("sort.oldest", { ns: NS.common })}
    </Button>
  );
}
