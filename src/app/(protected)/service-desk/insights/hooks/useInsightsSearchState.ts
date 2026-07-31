import { useEffect, useRef, useState } from "react";
import type { DateRange } from "react-day-picker";

import { SERVICE_DESK_KEY } from "@/feature/serviceDesk/shared/keys";
import {
  normalizeTicketSearchCriteriaFormValues,
  ticketSearchCriteriaFormDefaultValues,
  type TicketSearchCriteriaFormValues,
} from "@/feature/serviceDesk/ticketSearch";
import { useSessionStorageState } from "@/shared/client/useSessionStorageState";
import type { DateRangePreset } from "@/shared/types";

import {
  DEFAULT_INSIGHTS_PERIOD,
  INSIGHTS_SEARCH_STATE_DEFAULT_VALUES,
} from "../constants";
import type {
  CriteriaPeriodRange,
  InsightsSearchState,
  ViewOption,
} from "../types";
import {
  isDateRangePreset,
  toCompleteCriteriaPeriodRange,
} from "../util";

export function useInsightsSearchState() {
  const searchCriteriaState = useSessionStorageState<InsightsSearchState>({
    key: `${SERVICE_DESK_KEY}.insights`,
    initialValue: INSIGHTS_SEARCH_STATE_DEFAULT_VALUES,
  });

  const restoredSearchStateRef = useRef(false);
  const [criteria, setCriteria] = useState<TicketSearchCriteriaFormValues>(
    ticketSearchCriteriaFormDefaultValues,
  );
  const [scope, setScope] = useState<ViewOption>("INTERNAL");
  const [pickerRange, setPickerRange] = useState<DateRange | undefined>(
    ticketSearchCriteriaFormDefaultValues.period.dateRange,
  );
  const currentPeriodType = isDateRangePreset(criteria.period.type)
    ? criteria.period.type
    : DEFAULT_INSIGHTS_PERIOD;
  const nextPeriodTypeRef = useRef<DateRangePreset>(currentPeriodType);

  useEffect(() => {
    if (!searchCriteriaState.hydrated || restoredSearchStateRef.current) {
      return;
    }

    restoredSearchStateRef.current = true;

    const { scope: restoredScope = "INTERNAL", ...storedCriteria } =
      searchCriteriaState.value;
    const restoredCriteria =
      normalizeTicketSearchCriteriaFormValues(storedCriteria);

    setScope(restoredScope);
    setCriteria(restoredCriteria);
    setPickerRange(restoredCriteria.period.dateRange);
  }, [searchCriteriaState.hydrated, searchCriteriaState.value]);

  useEffect(() => {
    nextPeriodTypeRef.current = currentPeriodType;
  }, [currentPeriodType]);

  useEffect(() => {
    if (currentPeriodType !== "range") {
      setPickerRange(criteria.period.dateRange);
    }
  }, [criteria.period.dateRange, currentPeriodType]);

  const handleScopeChange = (nextScope: ViewOption) => {
    setScope(nextScope);
    searchCriteriaState.setValue((previous) => ({
      ...previous,
      scope: nextScope,
    }));
  };

  const updateCriteriaPeriod = (next: {
    type: DateRangePreset;
    dateRange: CriteriaPeriodRange;
  }) => {
    const nextCriteria: TicketSearchCriteriaFormValues = {
      ...criteria,
      period: {
        type: next.type,
        dateRange: next.dateRange,
      },
    };

    setCriteria(nextCriteria);
    searchCriteriaState.setValue((previous) => ({
      ...previous,
      ...nextCriteria,
      scope,
    }));
  };

  const handlePeriodChange = (selected?: DateRangePreset) => {
    const nextType = selected ?? currentPeriodType;

    nextPeriodTypeRef.current = nextType;
    updateCriteriaPeriod({
      type: nextType,
      dateRange: criteria.period.dateRange,
    });
  };

  const handleRangeChange = (selected: DateRange | undefined) => {
    setPickerRange(selected);

    const completeRange = toCompleteCriteriaPeriodRange(selected);
    if (!completeRange) {
      return;
    }

    updateCriteriaPeriod({
      type: nextPeriodTypeRef.current,
      dateRange: completeRange,
    });
  };

  return {
    hydrated: searchCriteriaState.hydrated,
    criteria,
    scope,
    currentPeriodType,
    pickerRange,
    handleScopeChange,
    handlePeriodChange,
    handleRangeChange,
  };
}
