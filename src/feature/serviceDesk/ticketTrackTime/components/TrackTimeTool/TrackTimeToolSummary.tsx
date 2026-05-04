type TrackTimeToolSummaryProps = {
  currentLabel: string;
  totalLabel: string;
  currentTrackedMinutes: number;
  totalTrackedMinutes: number;
  formatMinutes: (count: number) => string;
};

export function TrackTimeToolSummary({
  currentLabel,
  totalLabel,
  currentTrackedMinutes,
  totalTrackedMinutes,
  formatMinutes,
}: TrackTimeToolSummaryProps) {
  return (
    <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
      <div className="flex justify-between">
        <span>{currentLabel}</span>
        <strong className="text-foreground">
          {formatMinutes(currentTrackedMinutes)}
        </strong>
      </div>

      <div className="mt-1 flex justify-between">
        <span>{totalLabel}</span>
        <strong className="text-foreground">
          {formatMinutes(totalTrackedMinutes)}
        </strong>
      </div>
    </div>
  );
}
