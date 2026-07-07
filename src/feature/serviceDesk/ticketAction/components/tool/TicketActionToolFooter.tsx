import { SendHorizontal, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { NS } from "@/lib/i18n";

type TicketActionToolFooterProps = {
  disabled: boolean;
  errorMessage: string;
  helperText: string;
  isPending: boolean;
  submitDisabledTitle?: string;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: () => void;
};

export function TicketActionToolFooter({
  disabled,
  errorMessage,
  helperText,
  isPending,
  submitDisabledTitle,
  submitLabel,
  onCancel,
  onSubmit,
}: TicketActionToolFooterProps) {
  const { t } = useTranslation(NS.serviceDesk);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="break-words text-sm text-muted-foreground/75">
        {errorMessage || helperText}
      </div>

      <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="ghost"
          className="w-full whitespace-normal sm:w-auto"
          onClick={onCancel}
          disabled={isPending}
        >
          <X className="h-4 w-4" />
          {t("action.cancel", { ns: NS.common })}
        </Button>
        <span className="w-full sm:w-auto" title={submitDisabledTitle}>
          <Button
            type="button"
            className="w-full whitespace-normal sm:w-auto"
            onClick={onSubmit}
            disabled={disabled}
            title={submitDisabledTitle}
          >
            <SendHorizontal className="h-4 w-4" />
            {submitLabel}
          </Button>
        </span>
      </div>
    </div>
  );
}
