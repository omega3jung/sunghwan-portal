import insights from "./insights.json";
import shared from "./shared.json";
import ticket from "./ticket.json";
import ticketAction from "./ticketAction.json";
import ticketDetail from "./ticketDetail.json";
import ticketDraft from "./ticketDraft.json";
import ticketHistory from "./ticketHistory.json";
import ticketSearch from "./ticketSearch.json";

const serviceDesk = {
  ...shared,
  ...ticket,
  ...ticketDraft,
  ...ticketDetail,
  ...ticketHistory,
  ...ticketAction,
  ...ticketSearch,
  ...insights,
};

export default serviceDesk;
