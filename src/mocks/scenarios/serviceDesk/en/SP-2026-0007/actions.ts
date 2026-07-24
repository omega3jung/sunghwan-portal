import { TicketActionMockInput } from "../../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,
    tka_action_type: "COMMENT",
    tka_content:
      "Hello, James.<br>We reviewed Aria Young's account and current active sessions. We will lock the account and revoke the authentication credentials.",
    tka_owner_username: "julian_moon",
    tka_created_at: "2026-07-07T01:20:14Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 2,
    tka_action_type: "COMMENT",
    tka_content:
      "We locked the aria.young account and terminated all active sessions. We also revoked the MFA registrations and issued API tokens, and confirmed that there were no additional login attempts after the lock.",
    tka_owner_username: "julian_moon",
    tka_created_at: "2026-07-07T02:02:38Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {
      accountUsername: "aria_young",
      securityStatus: "ACCOUNT_LOCKED",
    },
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 3,
    tka_action_type: "ASSIGN",
    tka_content:
      "The security work is complete. HR Manager Matthew Williams has been added as an assignee to confirm the termination record and that the account should be closed.",
    tka_owner_username: "julian_moon",
    tka_created_at: "2026-07-07T02:04:12Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {
      fromAssigneeUsernames: [
        "isabella_oh",
        "julian_moon",
        "benjamin_hong",
        "aria_jeon",
      ],
      toAssigneeUsernames: [
        "isabella_oh",
        "julian_moon",
        "benjamin_hong",
        "aria_jeon",
        "matthew_williams",
      ],
    },
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 4,
    tka_action_type: "COMMENT",
    tka_content:
      "We confirmed the HR termination record. Aria Young's last working day was June 23, 2026, and the account is eligible for termination. The offboarding checklist has also been updated to show that the IT account lock is complete.",
    tka_owner_username: "matthew_williams",
    tka_created_at: "2026-07-07T02:34:45Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {
      hrVerificationStatus: "CONFIRMED",
    },
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 5,
    tka_action_type: "COMMENT",
    tka_content:
      "HR verification is complete. The account, sessions, and authentication credentials are all disabled, so this ticket will be resolved.",
    tka_owner_username: "julian_moon",
    tka_created_at: "2026-07-07T02:40:06Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {
      resolution: "OFFBOARDING_ACCOUNT_LOCK_COMPLETED",
    },
    tka_files: [],
    tka_images: [],
  },
];
