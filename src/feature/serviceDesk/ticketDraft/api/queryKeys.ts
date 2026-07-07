import { DataScope } from "@/domain/auth";
import {
  SERVICE_DESK_KEY,
  SERVICE_DESK_TICKET_DRAFT_KEY,
} from "@/feature/serviceDesk/shared/keys";

export const ticketDraftQueryKeys = {
  all: [SERVICE_DESK_KEY, SERVICE_DESK_TICKET_DRAFT_KEY] as const,

  drafts: () => [...ticketDraftQueryKeys.all, "draft"] as const,
  draft: ({
    userId,
    dataScope,
  }: {
    userId: string | null;
    dataScope: DataScope;
  }) => [...ticketDraftQueryKeys.drafts(), dataScope, userId] as const,
};
