import { TicketDetailPage } from "./components/TicketDetailPage";

type ServiceDeskTicketDetailPageProps = {
  params: Promise<{
    ticketId: string;
  }>;
};

export default async function ServiceDeskTicketDetailPage({
  params,
}: ServiceDeskTicketDetailPageProps) {
  const { ticketId } = await params;

  return <TicketDetailPage ticketId={ticketId} />;
}
