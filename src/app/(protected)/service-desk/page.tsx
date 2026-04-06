// src/app/(protected)/service-desk/page.tsx

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SupportedLanguage } from "@/domain/config";
import type { MainCategory } from "@/domain/serviceDesk";
import { useEmployeeListQuery } from "@/feature/organization/employee";
import { useServiceDeskCategoryListQuery } from "@/feature/serviceDesk";
import { SERVICE_DESK_KEY } from "@/feature/serviceDesk/keys";
import { useServiceDeskTicketListQuery } from "@/feature/serviceDesk/ticket/api/queries";
import { CreateTicketDialog } from "@/feature/serviceDesk/ticket/components/TicketFormDialog";
import { TicketList } from "@/feature/serviceDesk/ticket/components/TicketList";
import { TicketSearchCriteria } from "@/feature/serviceDesk/ticket/components/TicketSearchCriteria";
import {
  ticketSearchCriteriaFormDefaultValues,
  type TicketSearchCriteriaFormValues,
  useTicketSearchCriteriaForm,
} from "@/feature/serviceDesk/ticket/forms/searchCriteria";
import { mapSearchCriteriaToDbParams } from "@/feature/serviceDesk/ticket/utils/mapSearchCriteriaToDbParams";
import { useCurrentPreference } from "@/hooks/useCurrentPreference";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import { useSessionStorageState } from "@/hooks/useSessionStorageState";
import { useLocalizedValue } from "@/shared/hooks";
import type { ImageValueLabel } from "@/shared/types";

const isPresent = <T,>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

export default function ServiceDeskPage() {
  const router = useRouter();
  const { current: userPreference } = useCurrentPreference();
  const tLocal = useLocalizedValue(userPreference.language);
  const { data: currentSession } = useCurrentSession();

  const searchCriteriaState =
    useSessionStorageState<TicketSearchCriteriaFormValues>({
      key: SERVICE_DESK_KEY,
      initialValue: ticketSearchCriteriaFormDefaultValues,
    });

  const form = useTicketSearchCriteriaForm();
  const [params, setParams] = useState(() =>
    mapSearchCriteriaToDbParams(ticketSearchCriteriaFormDefaultValues),
  );

  const { data: categoryTrees } = useServiceDeskCategoryListQuery({
    filter: {
      rules: [
        {
          field: "id",
          operator: "=",
          value: currentSession?.user.companyId,
        },
      ],
    },
  });
  const { data: employees } = useEmployeeListQuery({});
  const { data: tickets, isLoading: isTicketListLoading } =
    useServiceDeskTicketListQuery(params);

  const categories = useMemo<MainCategory[]>(() => {
    return (categoryTrees ?? [])
      .flatMap((client) => client?.categories ?? [])
      .filter(isPresent)
      .map((category) => ({
        ...category,
        subCategories: (category.subCategories ?? []).filter(isPresent),
      }));
  }, [categoryTrees]);

  const users = useMemo<ImageValueLabel[]>(() => {
    if (!employees) {
      return [];
    }

    return employees.map((employee) => {
      const name = tLocal(employee.name);

      return {
        value: employee.id,
        label: `${name.first} ${name.last}`,
        displayName: employee.email,
        image: employee.imageUrl,
      };
    });
  }, [employees, tLocal]);

  useEffect(() => {
    if (!searchCriteriaState.hydrated) {
      return;
    }

    form.reset(searchCriteriaState.value);
    setParams(mapSearchCriteriaToDbParams(searchCriteriaState.value));
  }, [form, searchCriteriaState.hydrated, searchCriteriaState.value]);

  const handleSearchSubmit = async (values: TicketSearchCriteriaFormValues) => {
    searchCriteriaState.setValue(values);
    setParams(mapSearchCriteriaToDbParams(values));
  };

  const handleTicketSelected = (ticketId: string) => {
    router.push(`/service-desk/${ticketId}`);
  };

  return (
    <main className="flex h-full min-h-0 flex-col gap-4 p-4 md:p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">IT Service Desk</h1>
          <p className="text-sm text-muted-foreground">
            Search and browse service desk tickets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <TicketSearchCriteria
            form={form}
            categories={categories}
            users={users}
            onSubmit={handleSearchSubmit}
          />

          <CreateTicketDialog
            categories={categories}
            users={users}
            language={userPreference.language as SupportedLanguage}
            trigger={<Button type="button">Create Ticket</Button>}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 rounded-md border bg-background">
        <TicketList
          tickets={tickets ?? []}
          onTicketSelected={handleTicketSelected}
          users={users}
          language={userPreference.language as SupportedLanguage}
          isLoading={isTicketListLoading}
        />
      </ScrollArea>
    </main>
  );
}
