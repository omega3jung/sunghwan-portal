type Props = {
  params: {
    ticketId: string;
  };
};

export default function ServiceDeskTicketDetailPage({ params }: Props) {
  return (
    <main className="flex min-h-full flex-col gap-2 p-6">
      <h1 className="text-2xl font-semibold">Ticket Detail Page</h1>
      <p className="text-sm text-muted-foreground">
        Ticket ID: {params.ticketId}
      </p>
    </main>
  );
}
