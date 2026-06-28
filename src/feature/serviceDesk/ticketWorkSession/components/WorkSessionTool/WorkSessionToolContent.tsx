"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { InfoIcon } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TicketDetail } from "@/domain/serviceDesk";
import { NS } from "@/lib/i18n";
import { useMutationToast } from "@/shared/client/toast";

import { useSubmitTicketWorkSession } from "../../api/client";
import {
  TICKET_WORK_SESSION_NOTE_MAX_LENGTH,
  TICKET_WORK_SESSION_STATUS_OPTIONS,
} from "../../constants";
import {
  type TicketTrackDurationFormInput,
  ticketTrackDurationFormSchema,
  type TicketTrackRangeFormInput,
  ticketTrackRangeFormSchema,
  ticketWorkSessionDurationFormDefaultValues,
  ticketWorkSessionRangeFormDefaultValues,
  WORK_SESSION_VALIDATION_KEY,
} from "../../forms";
import type {
  TicketWorkSessionInputMode,
  TicketWorkSessionStatus,
} from "../../types";
import {
  canChangeStatus,
  getCurrentTrackedMinutes,
  getWorkSessionSubmitPayload,
} from "../../utils/payload";
import {
  WorkSessionDateTimeField,
  WorkSessionDurationField,
  WorkSessionNoteField,
  WorkSessionStatusField,
} from "./WorkSessionToolFields";
import { WorkSessionToolSummary } from "./WorkSessionToolSummary";

type WorkSessionToolContentProps = {
  onClose: () => void;
  ticket?: Pick<TicketDetail, "id" | "status" | "workMinutes"> | null;
};

const translateError = (
  t: (key: string, options?: Record<string, unknown>) => string,
  message?: string,
) => {
  return message ? t(message) : "";
};

function isWorkSessionStatus(
  status?: string | null,
): status is TicketWorkSessionStatus {
  return TICKET_WORK_SESSION_STATUS_OPTIONS.includes(
    status as TicketWorkSessionStatus,
  );
}

export function WorkSessionToolContent({
  onClose,
  ticket,
}: WorkSessionToolContentProps) {
  const { t } = useTranslation(NS.serviceDesk);
  const mutationToast = useMutationToast();
  const { mutateAsync: submitWorkSession, isPending } =
    useSubmitTicketWorkSession();

  const [activeTab, setActiveTab] =
    useState<TicketWorkSessionInputMode>("duration");
  const [selectedStatus, setSelectedStatus] =
    useState<TicketWorkSessionStatus | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [submitErrorKey, setSubmitErrorKey] = useState("");

  const durationForm = useForm<TicketTrackDurationFormInput>({
    resolver: zodResolver(ticketTrackDurationFormSchema),
    defaultValues: ticketWorkSessionDurationFormDefaultValues,
    mode: "onChange",
  });

  const rangeForm = useForm<TicketTrackRangeFormInput>({
    resolver: zodResolver(ticketTrackRangeFormSchema),
    defaultValues: ticketWorkSessionRangeFormDefaultValues,
    mode: "onChange",
  });

  const durationMinutes = durationForm.watch("durationMinutes");
  const startAt = rangeForm.watch("startAt");
  const endAt = rangeForm.watch("endAt");
  const previousTrackedMinutes = ticket?.workMinutes ?? 0;

  const noteErrorKey =
    note.length > TICKET_WORK_SESSION_NOTE_MAX_LENGTH
      ? WORK_SESSION_VALIDATION_KEY.noteMaxLength
      : "";

  useEffect(() => {
    setSubmitErrorKey("");
  }, [activeTab, durationMinutes, endAt, selectedStatus, startAt]);

  const nextStatus =
    selectedStatus && selectedStatus !== ticket?.status
      ? selectedStatus
      : undefined;

  const currentTrackedMinutes = useMemo(
    () =>
      getCurrentTrackedMinutes({
        inputMode: activeTab,
        durationValues: { durationMinutes },
        rangeValues: { startAt, endAt },
      }),
    [activeTab, durationMinutes, endAt, startAt],
  );

  const totalTrackedMinutes = previousTrackedMinutes + currentTrackedMinutes;

  const statusChangeAllowed =
    !nextStatus ||
    canChangeStatus({
      previousTrackedMinutes,
      currentTrackedMinutes,
    });

  const statusGuardErrorKey =
    nextStatus && !statusChangeAllowed
      ? "validation.workSession.statusRequiresTime"
      : "";

  const isSubmitBlockedByActiveTab =
    activeTab === "duration" ? currentTrackedMinutes <= 0 : !startAt || !endAt;

  const disableSubmit =
    !ticket ||
    isPending ||
    isSubmitBlockedByActiveTab ||
    Boolean(noteErrorKey) ||
    Boolean(statusGuardErrorKey);

  const submitLabel = nextStatus
    ? t("action.workSession.submitWithStatus")
    : t("action.workSession.submit");

  const durationError = translateError(
    t,
    durationForm.formState.errors.durationMinutes?.message,
  );
  const startAtError = translateError(
    t,
    rangeForm.formState.errors.startAt?.message,
  );
  const endAtError = translateError(
    t,
    rangeForm.formState.errors.endAt?.message,
  );
  const statusError = translateError(t, statusGuardErrorKey || submitErrorKey);
  const noteError = translateError(t, noteErrorKey);

  const statusSelectValue = selectedStatus ?? ticket?.status;
  const statusOptions = useMemo(() => {
    if (!ticket?.status || isWorkSessionStatus(ticket.status)) {
      return TICKET_WORK_SESSION_STATUS_OPTIONS;
    }

    return [ticket.status, ...TICKET_WORK_SESSION_STATUS_OPTIONS];
  }, [ticket?.status]);

  const noteDescribedBy = noteError
    ? "ticket-track-note-description ticket-track-note-error"
    : "ticket-track-note-description";

  const validateActiveForm = async () => {
    return activeTab === "duration"
      ? durationForm.trigger("durationMinutes")
      : rangeForm.trigger(["startAt", "endAt"]);
  };

  const setActiveFormPositiveError = () => {
    if (activeTab === "duration") {
      durationForm.setError("durationMinutes", {
        type: "validate",
        message: WORK_SESSION_VALIDATION_KEY.positive,
      });
      return;
    }

    rangeForm.setError("endAt", {
      type: "validate",
      message: WORK_SESSION_VALIDATION_KEY.invalidRange,
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitErrorKey("");

    if (!ticket) {
      return;
    }

    const isInputValid = await validateActiveForm();

    if (!isInputValid || noteErrorKey) {
      return;
    }

    const payload = getWorkSessionSubmitPayload({
      ticketId: ticket.id,
      inputMode: activeTab,
      durationValues: durationForm.getValues(),
      rangeValues: rangeForm.getValues(),
      nextStatus,
      note,
    });

    if (payload.trackedMinutes <= 0) {
      setActiveFormPositiveError();
      return;
    }

    if (
      payload.nextStatus &&
      !canChangeStatus({
        previousTrackedMinutes,
        currentTrackedMinutes: payload.trackedMinutes,
      })
    ) {
      setSubmitErrorKey("validation.workSession.statusRequiresTime");
      return;
    }

    try {
      const promise = submitWorkSession(payload);
      await mutationToast(promise, "update", t("field.workSession"));
      onClose();
    } catch {
      // Toast is handled by useMutationToast.
    }
  };

  const getStatusLabel = (status: string) =>
    isWorkSessionStatus(status)
      ? t(`option.status.${status.toLowerCase()}`)
      : status;

  return (
    <form onSubmit={handleSubmit} className="space-y-3 px-4 py-3">
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as TicketWorkSessionInputMode)
        }
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="duration">
            {t("workSessionTool.tab.duration")}
          </TabsTrigger>
          <TabsTrigger value="range">
            {t("workSessionTool.tab.range")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="duration" className="mt-4">
          <Controller
            control={durationForm.control}
            name="durationMinutes"
            render={({ field }) => (
              <WorkSessionDurationField
                value={field.value}
                onChange={field.onChange}
                error={durationError}
                label={t("field.durationMinutes")}
                placeholder={t("placeholder.workSession.durationMinutes")}
              />
            )}
          />
        </TabsContent>

        <TabsContent value="range" className="mt-4">
          <div className="space-y-3">
            <Controller
              control={rangeForm.control}
              name="startAt"
              render={({ field }) => (
                <WorkSessionDateTimeField
                  id="ticket-track-start-at"
                  label={t("field.startAt")}
                  value={field.value}
                  onChange={field.onChange}
                  error={startAtError}
                />
              )}
            />

            <Controller
              control={rangeForm.control}
              name="endAt"
              render={({ field }) => (
                <WorkSessionDateTimeField
                  id="ticket-track-end-at"
                  label={t("field.endAt")}
                  value={field.value}
                  onChange={field.onChange}
                  error={endAtError}
                />
              )}
            />
          </div>
        </TabsContent>
      </Tabs>

      <Separator />

      <WorkSessionStatusField
        value={statusSelectValue}
        onValueChange={(value) =>
          setSelectedStatus(isWorkSessionStatus(value) ? value : null)
        }
        options={statusOptions}
        getOptionLabel={getStatusLabel}
        label={
          <span className="flex items-center gap-1">
            {t("field.status")}
            <InfoIcon className="h-4 w-4 text-muted-foreground" />
          </span>
        }
        labelTitle={t("workSessionTool.status.description")}
        error={statusError}
      />

      <WorkSessionNoteField
        open={noteOpen}
        onOpenChange={setNoteOpen}
        value={note}
        onChange={setNote}
        placeholder={t("workSessionTool.note.description", {
          count: TICKET_WORK_SESSION_NOTE_MAX_LENGTH,
        })}
        toggleLabel={t("workSessionTool.note.toggle")}
        error={noteError}
        describedBy={noteDescribedBy}
      />

      <WorkSessionToolSummary
        currentLabel={t("workSessionTool.summary.current")}
        totalLabel={t("workSessionTool.summary.totalAfterSubmit")}
        currentTrackedMinutes={currentTrackedMinutes}
        totalTrackedMinutes={totalTrackedMinutes}
        formatMinutes={(count) =>
          t("workSessionTool.summary.minutes", { count })
        }
      />

      <Button type="submit" className="w-full" disabled={disableSubmit}>
        {isPending ? t("action.workSession.submitting") : submitLabel}
      </Button>
    </form>
  );
}
