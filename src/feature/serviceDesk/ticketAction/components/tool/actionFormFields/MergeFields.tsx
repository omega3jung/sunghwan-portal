import { useEffect, useMemo } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useServiceDeskTicketListQuery } from "@/feature/serviceDesk/ticket/api/client";
import { NS } from "@/lib/i18n";
import { DbParams } from "@/shared/types/api";
import {
  combineRuleGroups,
  createFieldFilter,
} from "@/shared/utils/routing";

import { TicketActionDraftFormValues } from "../../../forms";
import { setActionFieldValue, type Translate } from "../utils";

type MergeFieldsProps = {
  ticketId: string;
  form: UseFormReturn<TicketActionDraftFormValues>;
  t: Translate;
};

export function MergeFields({ ticketId, form, t }: MergeFieldsProps) {
  const targetTicketId = useWatch({
    control: form.control,
    name: "targetTicketId",
  });

  const onTargetTicketIdChange = (value: string) => {
    setActionFieldValue(form, "targetTicketId", value);
  };
  const targetTicketError =
    typeof form.formState.errors.targetTicketId?.message === "string"
      ? t(form.formState.errors.targetTicketId.message)
      : "";

  const params = useMemo<DbParams>(
    () => ({
      filter: combineRuleGroups([
        createFieldFilter({
          field: "active",
          value: true,
        }),
        createFieldFilter({
          field: "status",
          operator: "!=",
          value: "Draft",
        }),
      ]),
    }),
    [],
  );

  const { data: ticketList = [], isLoading: isTicketListLoading } =
    useServiceDeskTicketListQuery(params);
  const canMergeTicketList = useMemo(
    () =>
      ticketList.filter(
        (ticket) =>
          ticket.id !== ticketId &&
          ticket.status !== "Draft" &&
          ticket.mergedIntoTicketId == null,
      ),
    [ticketId, ticketList],
  );
  const hasMergeTicketList = canMergeTicketList.length > 0;
  const emptyMergeCandidateLabel = `${t("actionTool.form.targetTicketId")}: ${t("empty.noResults", { ns: NS.common })}`;
  const selectPlaceholder = hasMergeTicketList
    ? t("placeholder.select", {
        target: t("actionTool.form.targetTicketId"),
        ns: NS.common,
      })
    : emptyMergeCandidateLabel;

  useEffect(() => {
    if (isTicketListLoading || !targetTicketId) {
      return;
    }

    const isValidTarget = canMergeTicketList.some(
      (ticket) => ticket.id === targetTicketId,
    );

    if (!isValidTarget) {
      setActionFieldValue(form, "targetTicketId", "");
    }
  }, [canMergeTicketList, form, isTicketListLoading, targetTicketId]);

  return (
    <Field data-invalid={Boolean(targetTicketError)}>
      <FieldLabel>{t("actionTool.form.targetTicketId")}</FieldLabel>

      {isTicketListLoading ? (
        <Skeleton className="h-9 w-full rounded-md" />
      ) : (
        <Select
          value={targetTicketId}
          onValueChange={onTargetTicketIdChange}
          disabled={!hasMergeTicketList}
        >
          <SelectTrigger id="ticket-action-merge-target">
            <SelectValue placeholder={selectPlaceholder} />
          </SelectTrigger>

          <SelectContent>
            {hasMergeTicketList ? (
              canMergeTicketList.map((ticket) => (
                <SelectItem key={ticket.id} value={ticket.id}>
                  {`#${ticket.ticketNumber} - ${ticket.subject}`}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="__empty" disabled>
                {emptyMergeCandidateLabel}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      )}
      <FieldError>{targetTicketError}</FieldError>
    </Field>
  );
}
