import { addDays, startOfToday } from "date-fns";

import { DatePicker } from "@/components/custom/DatePicker";
import { Field, FieldLabel } from "@/components/ui/field";
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
import { NS } from "@/lib/i18n";

import type { Translate } from "./utils";

type AdjustFieldsProps = {
  priority?: string;
  riskLevel?: string;
  dueDate?: Date;
  onPriorityChange?: (value: string) => void;
  onRiskLevelChange?: (value: string) => void;
  onDueDateChange?: (value?: Date) => void;
  t: Translate;
};

export function AdjustFields({
  priority = "",
  riskLevel = "",
  dueDate,
  onPriorityChange = () => undefined,
  onRiskLevelChange = () => undefined,
  onDueDateChange = () => undefined,
  t,
}: AdjustFieldsProps) {
  const minDueDate = addDays(startOfToday(), 1);

  return (
    <>
      <Field>
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

      <Field>
        <FieldLabel>{t("field.riskLevel")}</FieldLabel>
        <Select value={riskLevel} onValueChange={onRiskLevelChange}>
          <SelectTrigger>
            <SelectValue placeholder={t("field.riskLevel")} />
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

      <Field className="col-span-2">
        <FieldLabel>{t("field.dueDate", { ns: NS.common })}</FieldLabel>
        <DatePicker
          id="ticket-action-input-due-date"
          className="h-9"
          value={dueDate}
          onChange={onDueDateChange}
          minDate={minDueDate}
        />
      </Field>
    </>
  );
}
