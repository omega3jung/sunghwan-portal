import { addDays, startOfToday } from "date-fns";
import { useEffect, useMemo } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";

import { DatePicker } from "@/components/custom/DatePicker";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Priority, RiskLevel } from "@/domain/common";
import {
  priorityOptions,
  riskLevelOptions,
} from "@/feature/serviceDesk/shared/options";
import { NS } from "@/lib/application/i18n";
import { ValueLabel } from "@/shared/types";

import { TicketActionDraftFormValues } from "../../../forms";
import { setActionFieldValue, type Translate } from "../utils";

type AdjustFieldsProps = {
  form: UseFormReturn<TicketActionDraftFormValues>;
  t: Translate;
};

export function AdjustFields({ form, t }: AdjustFieldsProps) {
  const minDueAt = useMemo(() => addDays(startOfToday(), 1), []);

  const priority = useWatch({ control: form.control, name: "priority" });
  const riskLevel = useWatch({ control: form.control, name: "riskLevel" });
  const dueAt = useWatch({ control: form.control, name: "dueAt" });

  useEffect(() => {
    if (dueAt && dueAt.getTime() >= minDueAt.getTime()) {
      return;
    }

    setActionFieldValue(form, "dueAt", minDueAt);
  }, [dueAt, form, minDueAt]);

  const priorityData = useMemo((): ValueLabel<Priority>[] => {
    if (!priorityOptions) return [];

    return priorityOptions.map((priority) => {
      return {
        value: priority.value,
        label: t(`enum.priority.options.${priority.value}`, { ns: NS.shared }),
      };
    });
  }, [t]);

  const riskLevelData = useMemo((): ValueLabel<RiskLevel>[] => {
    if (!riskLevelOptions) return [];

    return riskLevelOptions.map((riskLevel) => {
      return {
        value: riskLevel.value,
        label: t(`enum.riskLevel.options.${riskLevel.value}`, {
          ns: NS.shared,
        }),
      };
    });
  }, [t]);

  const onPriorityChange = (value: string) => {
    form.clearErrors(["priority", "riskLevel", "dueAt"]);
    setActionFieldValue(form, "priority", value);
  };

  const onRiskLevelChange = (value: string) => {
    form.clearErrors(["priority", "riskLevel", "dueAt"]);
    setActionFieldValue(form, "riskLevel", value);
  };

  const onDueAtChange = (value: Date | undefined) => {
    form.clearErrors(["priority", "riskLevel", "dueAt"]);
    setActionFieldValue(form, "dueAt", value);
  };

  const adjustError = useMemo(() => {
    const errorKeys = [
      form.formState.errors.priority?.message,
      form.formState.errors.riskLevel?.message,
      form.formState.errors.dueAt?.message,
    ];
    const matchedKey = errorKeys.find(
      (value): value is string => typeof value === "string",
    );

    return matchedKey ? t(matchedKey) : "";
  }, [
    form.formState.errors.dueAt?.message,
    form.formState.errors.priority?.message,
    form.formState.errors.riskLevel?.message,
    t,
  ]);

  return (
    <>
      <Field data-invalid={Boolean(adjustError)}>
        <FieldLabel>{t("field.priority", { ns: NS.common })}</FieldLabel>
        <Select
          items={priorityData}
          value={priority}
          onValueChange={(value) => {
            if (value !== null) {
              onPriorityChange(value);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("field.priority", { ns: NS.common })} />
          </SelectTrigger>
          <SelectContent>
            {priorityData.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field data-invalid={Boolean(adjustError)}>
        <FieldLabel>{t("field.riskLevel", { ns: NS.common })}</FieldLabel>
        <Select
          items={riskLevelData}
          value={riskLevel}
          onValueChange={(value) => {
            if (value !== null) {
              onRiskLevelChange(value);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={t("field.riskLevel", { ns: NS.common })}
            />
          </SelectTrigger>
          <SelectContent>
            {riskLevelData.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field
        className="col-span-full md:col-span-2"
        data-invalid={Boolean(adjustError)}
      >
        <FieldLabel>{t("field.dueAt", { ns: NS.common })}</FieldLabel>
        <DatePicker
          id="ticket-action-input-due-date"
          className="h-9"
          value={dueAt}
          onChange={onDueAtChange}
          minDate={minDueAt}
        />
        <FieldError>{adjustError}</FieldError>
      </Field>
    </>
  );
}
