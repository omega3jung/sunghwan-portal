import { ArrowDown01, ArrowDown10, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NS } from "@/lib/i18n";
import { cn } from "@/shared/utils/presentation";

type TicketActionListHeaderProps = {
  count: number;
  query: string;
  sortOrder: "desc" | "asc";
  showHeader?: boolean;
  onQueryChange: (value: string) => void;
  onToggleSort: () => void;
};

export function TicketActionListHeader({
  count,
  query,
  sortOrder,
  showHeader = true,
  onQueryChange,
  onToggleSort,
}: TicketActionListHeaderProps) {
  const { t } = useTranslation(NS.serviceDesk);

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        showHeader && "md:flex-row md:items-center md:justify-between",
        !showHeader && "sm:flex-row sm:items-center sm:justify-end",
      )}
    >
      {showHeader ? (
        <div className="flex items-center gap-2">
          <h2
            className="text-base font-semibold tracking-[-0.01em]"
            title={t("actionTool.list.titleHint")}
          >
            {t("actionTool.list.title")}
          </h2>
          {count ? (
            <>
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary hover:bg-muted"
              >
                {count}
              </Badge>
              <span className="text-sm text-muted-foreground/75">
                {t("actionTool.list.countLabel", { count })}
              </span>
            </>
          ) : null}
        </div>
      ) : null}

      <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row">
        <ActionSearchBar
          placeholder={t("actionTool.list.searchPlaceholder")}
          value={query}
          onChange={onQueryChange}
        />
        <ActionSortButton sortOrder={sortOrder} onClick={onToggleSort} />
      </div>
    </div>
  );
}

function ActionSearchBar({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative min-w-0 w-full sm:w-72">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}

function ActionSortButton({
  sortOrder,
  onClick,
}: {
  sortOrder: "desc" | "asc";
  onClick: () => void;
}) {
  const { t } = useTranslation(NS.serviceDesk);

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full justify-between gap-2 whitespace-normal sm:w-auto"
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
