import { SendHorizontal, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { NS } from "@/lib/i18n";

type TicketActionToolFooterProps = {
  disabled: boolean;
  errorMessage: string;
  helperText: string;
  isPending: boolean;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: () => void;
};

export function TicketActionToolFooter({
  disabled,
  errorMessage,
  helperText,
  isPending,
  submitLabel,
  onCancel,
  onSubmit,
}: TicketActionToolFooterProps) {
  const { t } = useTranslation(NS.serviceDesk);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground/75">
        {errorMessage || helperText}
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isPending}
        >
          <X className="h-4 w-4" />
          {t("action.cancel", { ns: NS.common })}
        </Button>
        <Button type="button" onClick={onSubmit} disabled={disabled}>
          <SendHorizontal className="h-4 w-4" />
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
