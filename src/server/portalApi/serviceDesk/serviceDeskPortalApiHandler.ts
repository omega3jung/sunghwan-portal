import type { NextRequest } from "next/server";

import { toApiErrorResponse } from "@/server/portalApi/http";

import type { PortalApiJsonOptions } from "../types";
import { normalizePath } from "../utils";
import { handleApprovalStepPortalApi } from "./approvalStepApiHandler";
import { handleAssignmentRulePortalApi } from "./assignmentRuleApiHandler";
import { handleCategoryPortalApi } from "./categoryApiHandler";
import {
  createNotFoundResponse,
  type ServiceDeskPortalApiContext,
} from "./serviceDeskPortalApiUtils";
import { handleTenantPortalApi } from "./tenantApiHandler";
import { handleTicketActionPortalApi } from "./ticketActionApiHandler";
import { handleTicketPortalApi } from "./ticketApiHandler";
import { handleTicketHistoryPortalApi } from "./ticketHistoryApiHandler";
import { handleWorkSessionPortalApi } from "./workSessionApiHandler";

export async function handleServiceDeskPortalApi(
  request: NextRequest,
  options: PortalApiJsonOptions,
) {
  const path = normalizePath(options.path);
  const method = options.method ?? "GET";

  try {
    const context: ServiceDeskPortalApiContext = {
      request,
      options,
      path,
      method,
    };

    if (path.startsWith("/service-desk/tenants")) {
      return await handleTenantPortalApi(context);
    }

    if (path.startsWith("/service-desk/categories")) {
      return await handleCategoryPortalApi(context);
    }

    if (path.startsWith("/service-desk/approval-steps")) {
      return await handleApprovalStepPortalApi(context);
    }

    if (path.startsWith("/service-desk/assignment-rules")) {
      return await handleAssignmentRulePortalApi(context);
    }

    if (path.startsWith("/service-desk/tickets")) {
      return await handleTicketPortalApi(context);
    }

    if (path.startsWith("/service-desk/ticket-actions")) {
      return await handleTicketActionPortalApi(context);
    }

    if (path.startsWith("/service-desk/ticket-history")) {
      return await handleTicketHistoryPortalApi(context);
    }

    if (path.startsWith("/service-desk/work-sessions")) {
      return await handleWorkSessionPortalApi(context);
    }

    return createNotFoundResponse();
  } catch (error) {
    return toApiErrorResponse(error, {
      fallbackMessage: options.errorMessage,
    });
  }
}
