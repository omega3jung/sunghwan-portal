type WorkSessionToolSummaryProps = {
  currentLabel: string;
  totalLabel: string;
  currentTrackedMinutes: number;
  totalTrackedMinutes: number;
  formatMinutes: (count: number) => string;
};

export function WorkSessionToolSummary({
  currentLabel,
  totalLabel,
  currentTrackedMinutes,
  totalTrackedMinutes,
  formatMinutes,
}: WorkSessionToolSummaryProps) {
  return (
    <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
      <div className="flex flex-wrap items-center justify-between gap-1">
        <span>{currentLabel}</span>
        <strong className="text-foreground">
          {formatMinutes(currentTrackedMinutes)}
        </strong>
      </div>

      <div className="mt-1 flex flex-wrap items-center justify-between gap-1">
        <span>{totalLabel}</span>
        <strong className="text-foreground">
          {formatMinutes(totalTrackedMinutes)}
        </strong>
      </div>
    </div>
  );
}
