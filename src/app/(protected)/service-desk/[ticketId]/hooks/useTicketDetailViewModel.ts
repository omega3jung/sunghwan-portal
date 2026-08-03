import { useMemo } from "react";

import type {
  TicketAction,
  TicketDetail,
  TicketHistory,
} from "@/domain/serviceDesk";
import { useCurrentSession } from "@/feature/auth/session/client";
import { useEmployeeListQuery } from "@/feature/organization/employee/client";
import { useServiceDeskCategoryListQuery } from "@/feature/serviceDesk/category/client";
import { selectTicketAssignees } from "@/feature/serviceDesk/ticket/utils";
import { useCurrentPreference } from "@/feature/user/preference/client";
import type { SupportedLanguage } from "@/lib/application/i18n";
import { formatDisplayName } from "@/lib/application/organization";
import { useLocalizedValue } from "@/lib/client/i18n";
import { dateLocaleMap } from "@/shared/mapper/dateLocaleMap";
import type { DbParams, ImageValueLabel } from "@/shared/types";
import { combineRuleGroups, createFieldFilter } from "@/shared/utils/routing";

type UseTicketDetailViewModelParams = {
  ticket?: TicketDetail;
  ticketActions?: TicketAction[];
  ticketHistories?: TicketHistory[];
};

export function useTicketDetailViewModel({
  ticket,
  ticketActions,
  ticketHistories,
}: UseTicketDetailViewModelParams) {
  const { current: userPreference } = useCurrentPreference();
  const language = userPreference.language as SupportedLanguage;
  const tLocal = useLocalizedValue(userPreference.language);
  const { current } = useCurrentSession();
  const effectiveCompanyId = current.user?.companyId;

  const categoryListParams = useMemo<DbParams | undefined>(() => {
    if (effectiveCompanyId === undefined) return undefined;

    return {
      filter: combineRuleGroups([
        createFieldFilter({
          field: "active",
          value: true,
        }),
        createFieldFilter({
          field: "tenant_company_id",
          value: effectiveCompanyId,
        }),
      ]),
    };
  }, [effectiveCompanyId]);
  const employeeListParams = useMemo<DbParams | undefined>(() => {
    if (effectiveCompanyId === undefined) return undefined;

    return {
      filter: combineRuleGroups([
        createFieldFilter({
          field: "companyId",
          value: effectiveCompanyId,
        }),
        createFieldFilter({
          field: "e_active",
          value: true,
        }),
      ]),
    };
  }, [effectiveCompanyId]);
  const { data: categoryTrees } =
    useServiceDeskCategoryListQuery(categoryListParams);
  const { data: employees } = useEmployeeListQuery(employeeListParams);

  const assigneeOptions = useMemo<ImageValueLabel[]>(() => {
    if (!employees) {
      return [];
    }

    return employees.map((employee) => {
      const name = tLocal(employee.name);

      return {
        value: employee.username,
        label: `${name.first} ${name.last}`.trim(),
        displayName: employee.email,
        image: employee.imageUrl,
      };
    });
  }, [employees, tLocal]);
  const recipientOptions = useMemo<ImageValueLabel[]>(() => {
    if (!employees) {
      return [];
    }

    return employees.map((employee) => {
      const name = tLocal(employee.name);

      return {
        value: employee.email,
        label: `${name.first} ${name.last}`,
        displayName: employee.email,
        image: employee.imageUrl,
      };
    });
  }, [employees, tLocal]);
  const ticketAssignees = useMemo(
    () =>
      ticket
        ? selectTicketAssignees(ticket).map((assignee) => ({
            value: assignee.username,
            label: formatDisplayName(tLocal(assignee.name)),
            displayName: assignee.username,
            image: assignee.image ?? undefined,
          }))
        : [],
    [ticket, tLocal],
  );
  const requesterName = ticket
    ? formatDisplayName(tLocal(ticket.requester.name))
    : undefined;
  const dateLocale = useMemo(
    () => dateLocaleMap[language],
    [language],
  );
  const categories = useMemo(
    () => categoryTrees?.flatMap((tree) => tree.categories) ?? [],
    [categoryTrees],
  );
  const activeActions = useMemo(
    () => (ticketActions ?? []).filter((action) => action.active),
    [ticketActions],
  );
  const latestAction = useMemo(() => {
    return [...activeActions].sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    )[0];
  }, [activeActions]);
  const latestHistory = useMemo(() => {
    return [...(ticketHistories ?? [])].sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    )[0];
  }, [ticketHistories]);
  const latestActionOwnerName = latestAction?.ownerName
    ? formatDisplayName(tLocal(latestAction.ownerName))
    : latestAction?.ownerUsername;

  return {
    language,
    dateLocale,
    categories,
    assigneeOptions,
    recipientOptions,
    ticketAssignees,
    requesterName,
    activeActions,
    latestAction,
    latestHistory,
    latestActionOwnerName,
  };
}
