import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/input";
import { NS } from "@/lib/i18n";

type TicketCommentSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function TicketCommentSearchBar({
  value,
  onChange,
}: TicketCommentSearchBarProps) {
  const { t } = useTranslation(NS.serviceDesk);

  return (
    <div className="relative w-full sm:w-72">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        placeholder={t("comment.search.placeholder")}
        className="pl-9"
      />
    </div>
  );
}
