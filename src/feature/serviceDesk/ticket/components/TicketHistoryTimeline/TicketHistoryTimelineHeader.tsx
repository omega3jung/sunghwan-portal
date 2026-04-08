type TicketHistoryTimelineHeaderProps = {
  title?: string;
  description?: string;
};

export function TicketHistoryTimelineHeader({
  title = "Ticket History",
  description = "Timeline view for recent ticket activity.",
}: TicketHistoryTimelineHeaderProps) {
  return (
    <div className="min-w-0">
      <h2 className="text-sm font-semibold text-primary">{title}</h2>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
