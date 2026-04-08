"use client";

import { Info, Mail, UserRound } from "lucide-react";

import type { TicketDetail } from "@/domain/serviceDesk";
import { ImageValueLabel } from "@/shared/types";

import {
  EmptyText,
  InfoCard,
  InfoLine,
  PersonRow,
  RecipientGroup,
} from "./TicketDetailUi";

type TicketDetailsAsideProps = {
  ticket: TicketDetail;
  requester?: ImageValueLabel;
  assignees: ImageValueLabel[];
};

export function TicketDetailsAside({
  ticket,
  requester,
  assignees,
}: TicketDetailsAsideProps) {
  return (
    <div className="space-y-4">
      <InfoCard icon={<UserRound className="h-4 w-4" />} title="Requester">
        <PersonRow
          name={requester?.label || ticket.requesterId}
          subText={requester?.displayName || ticket.requesterId}
          image={requester?.image}
        />
      </InfoCard>

      <InfoCard icon={<UserRound className="h-4 w-4" />} title="Assignee">
        {assignees.length > 0 ? (
          <div className="space-y-3">
            {assignees.map((assignee) => (
              <PersonRow
                key={assignee.value}
                name={assignee.label}
                subText={assignee.displayName}
                image={assignee.image}
              />
            ))}
          </div>
        ) : (
          <EmptyText value="Unassigned" />
        )}
      </InfoCard>

      <InfoCard icon={<Mail className="h-4 w-4" />} title="Recipients">
        <RecipientGroup label="To" values={ticket.email.to} />
        <RecipientGroup label="Cc" values={ticket.email.cc} />
        <RecipientGroup label="Bcc" values={ticket.email.bcc} />
      </InfoCard>

      <InfoCard icon={<Info className="h-4 w-4" />} title="Details">
        <InfoLine label="Ticket ID" value={ticket.id} />
        <InfoLine label="Category" value={ticket.categoryId} />
        <InfoLine label="Last commenter" value={ticket.lastCommenterEmail} />
      </InfoCard>
    </div>
  );
}
