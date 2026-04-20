import { addDays, startOfToday } from "date-fns";
import { useMemo } from "react";
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
import {
  priorityOptions,
  riskLevelOptions,
} from "@/feature/serviceDesk/shared/options";
import { TicketActionDraftFormValues } from "@/feature/serviceDesk/ticket/action/forms";
import { NS } from "@/lib/i18n";

import { setActionFieldValue, type Translate } from "../utils";

type AdjustFieldsProps = {
  form: UseFormReturn<TicketActionDraftFormValues>;
  t: Translate;
};

export function AdjustFields({ form, t }: AdjustFieldsProps) {
  const mindueAt = addDays(startOfToday(), 1);

  const priority = useWatch({ control: form.control, name: "priority" });
  const riskLevel = useWatch({ control: form.control, name: "riskLevel" });
  const dueAt = useWatch({ control: form.control, name: "dueAt" });

  const onPriorityChange = (value: string) => {
    form.clearErrors(["priority", "riskLevel", "dueAt"]);
    setActionFieldValue(form, "priority", value);
  };

  const onRiskLevelChange = (value: string) => {
    form.clearErrors(["priority", "riskLevel", "dueAt"]);
    setActionFieldValue(form, "riskLevel", value);
  };

  const ondueAtChange = (value: Date | undefined) => {
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
        <Select value={priority} onValueChange={onPriorityChange}>
          <SelectTrigger>
            <SelectValue placeholder={t("field.priority", { ns: NS.common })} />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field data-invalid={Boolean(adjustError)}>
        <FieldLabel>{t("field.riskLevel", { ns: NS.common })}</FieldLabel>
        <Select value={riskLevel} onValueChange={onRiskLevelChange}>
          <SelectTrigger>
            <SelectValue
              placeholder={t("field.riskLevel", { ns: NS.common })}
            />
          </SelectTrigger>
          <SelectContent>
            {riskLevelOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field className="col-span-2" data-invalid={Boolean(adjustError)}>
        <FieldLabel>{t("field.dueAt", { ns: NS.common })}</FieldLabel>
        <DatePicker
          id="ticket-action-input-due-date"
          className="h-9"
          value={dueAt}
          onChange={ondueAtChange}
          minDate={mindueAt}
        />
        <FieldError>{adjustError}</FieldError>
      </Field>
    </>
  );
}
