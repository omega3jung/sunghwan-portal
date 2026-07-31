import { TicketIdPage } from "./components/ticketIdPage";

type ServiceDeskTicketDetailPageProps = {
  params: Promise<{
    ticketId: string;
  }>;
};

export default async function ServiceDeskTicketDetailPage({
  params,
}: ServiceDeskTicketDetailPageProps) {
  const { ticketId } = await params;

  return <TicketIdPage ticketId={ticketId} />;
}
