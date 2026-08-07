import { useMemo } from "react";

import type { MainCategory } from "@/domain/serviceDesk";
import { useCurrentSession } from "@/feature/auth/session/client";
import { useEmployeeListQuery } from "@/feature/organization/employee/client";
import { useServiceDeskCategoryListQuery } from "@/feature/serviceDesk/category/client";
import { useCurrentPreference } from "@/feature/user/preference/client";
import type { TicketSearchResponse } from "@/lib/application/contracts/serviceDesk";
import type { SupportedLanguage } from "@/lib/application/i18n";
import { useLocalizedValue } from "@/lib/client/i18n";
import type { DbParams, ImageValueLabel } from "@/shared/types";
import { combineRuleGroups, createFieldFilter } from "@/shared/utils/routing";

type UseServiceDeskViewModelParams = {
  ticketSearchResult?: TicketSearchResponse;
};

const isPresent = <T,>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

export function useServiceDeskViewModel({
  ticketSearchResult,
}: UseServiceDeskViewModelParams) {
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

  const categories = useMemo<MainCategory[]>(() => {
    return (categoryTrees ?? [])
      .flatMap((client) => client?.categories ?? [])
      .filter(isPresent)
      .map((category) => ({
        ...category,
        subCategories: (category.subCategories ?? []).filter(isPresent),
      }));
  }, [categoryTrees]);

  const requesterOptions = useMemo<ImageValueLabel[]>(
    () =>
      (ticketSearchResult?.facets?.requesters ?? []).map((requester) => ({
        value: requester.username,
        label:
          `${tLocal(requester.name).first} ${tLocal(requester.name).last}`.trim(),
        displayName: requester.username,
        image: requester.image ?? undefined,
      })),
    [ticketSearchResult?.facets?.requesters, tLocal],
  );
  const assigneeOptions = useMemo<ImageValueLabel[]>(
    () =>
      (ticketSearchResult?.facets?.assignees ?? []).map((assignee) => ({
        value: assignee.username,
        label:
          `${tLocal(assignee.name).first} ${tLocal(assignee.name).last}`.trim(),
        displayName: assignee.username,
        image: assignee.image ?? undefined,
      })),
    [ticketSearchResult?.facets?.assignees, tLocal],
  );
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

  return {
    language,
    categories,
    requesterOptions,
    assigneeOptions,
    recipientOptions,
  };
}
