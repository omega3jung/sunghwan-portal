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

import { useSubmitTicketTrackTime } from "../../api";
import {
  TICKET_TRACK_TIME_NOTE_MAX_LENGTH,
  TICKET_TRACK_TIME_STATUS_OPTIONS,
} from "../../constants";
import {
  type TicketTrackDurationFormInput,
  ticketTrackDurationFormSchema,
  type TicketTrackRangeFormInput,
  ticketTrackRangeFormSchema,
  ticketTrackTimeDurationFormDefaultValues,
  ticketTrackTimeRangeFormDefaultValues,
  TRACK_TIME_VALIDATION_KEY,
} from "../../forms";
import type {
  TicketTrackTimeInputMode,
  TicketTrackTimeStatus,
} from "../../types";
import {
  canChangeStatus,
  getCurrentTrackedMinutes,
  getTrackTimeSubmitPayload,
} from "./payload";
import {
  TrackTimeDateTimeField,
  TrackTimeDurationField,
  TrackTimeNoteField,
  TrackTimeStatusField,
} from "./TrackTimeToolFields";
import { TrackTimeToolSummary } from "./TrackTimeToolSummary";

type TrackTimeToolContentProps = {
  onClose: () => void;
  ticket?: Pick<TicketDetail, "id" | "status" | "trackTimeMinutes"> | null;
};

const translateError = (
  t: (key: string, options?: Record<string, unknown>) => string,
  message?: string,
) => {
  return message ? t(message) : "";
};

function isTrackTimeStatus(
  status?: string | null,
): status is TicketTrackTimeStatus {
  return TICKET_TRACK_TIME_STATUS_OPTIONS.includes(
    status as TicketTrackTimeStatus,
  );
}

export function TrackTimeToolContent({
  onClose,
  ticket,
}: TrackTimeToolContentProps) {
  const { t } = useTranslation(NS.serviceDesk);
  const mutationToast = useMutationToast();
  const { mutateAsync: submitTrackTime, isPending } =
    useSubmitTicketTrackTime();

  const [activeTab, setActiveTab] =
    useState<TicketTrackTimeInputMode>("duration");
  const [selectedStatus, setSelectedStatus] =
    useState<TicketTrackTimeStatus | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [submitErrorKey, setSubmitErrorKey] = useState("");

  const durationForm = useForm<TicketTrackDurationFormInput>({
    resolver: zodResolver(ticketTrackDurationFormSchema),
    defaultValues: ticketTrackTimeDurationFormDefaultValues,
    mode: "onChange",
  });

  const rangeForm = useForm<TicketTrackRangeFormInput>({
    resolver: zodResolver(ticketTrackRangeFormSchema),
    defaultValues: ticketTrackTimeRangeFormDefaultValues,
    mode: "onChange",
  });

  const durationMinutes = durationForm.watch("durationMinutes");
  const startAt = rangeForm.watch("startAt");
  const endAt = rangeForm.watch("endAt");
  const previousTrackedMinutes = ticket?.trackTimeMinutes ?? 0;

  const noteErrorKey =
    note.length > TICKET_TRACK_TIME_NOTE_MAX_LENGTH
      ? TRACK_TIME_VALIDATION_KEY.noteMaxLength
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
      ? "validation.trackTime.statusRequiresTime"
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
    ? t("action.trackTime.submitWithStatus")
    : t("action.trackTime.submit");

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
    if (!ticket?.status || isTrackTimeStatus(ticket.status)) {
      return TICKET_TRACK_TIME_STATUS_OPTIONS;
    }

    return [ticket.status, ...TICKET_TRACK_TIME_STATUS_OPTIONS];
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
        message: TRACK_TIME_VALIDATION_KEY.positive,
      });
      return;
    }

    rangeForm.setError("endAt", {
      type: "validate",
      message: TRACK_TIME_VALIDATION_KEY.invalidRange,
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

    const payload = getTrackTimeSubmitPayload({
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
      setSubmitErrorKey("validation.trackTime.statusRequiresTime");
      return;
    }

    try {
      const promise = submitTrackTime(payload);
      await mutationToast(promise, "update", t("field.trackTime"));
      onClose();
    } catch {
      // Toast is handled by useMutationToast.
    }
  };

  const getStatusLabel = (status: string) =>
    isTrackTimeStatus(status)
      ? t(`option.status.${status.toLowerCase()}`)
      : status;

  return (
    <form onSubmit={handleSubmit} className="space-y-3 px-4 py-3">
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as TicketTrackTimeInputMode)
        }
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="duration">
            {t("trackTimeTool.tab.duration")}
          </TabsTrigger>
          <TabsTrigger value="range">
            {t("trackTimeTool.tab.range")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="duration" className="mt-4">
          <Controller
            control={durationForm.control}
            name="durationMinutes"
            render={({ field }) => (
              <TrackTimeDurationField
                value={field.value}
                onChange={field.onChange}
                error={durationError}
                label={t("field.durationMinutes")}
                placeholder={t("placeholder.trackTime.durationMinutes")}
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
                <TrackTimeDateTimeField
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
                <TrackTimeDateTimeField
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

      <TrackTimeStatusField
        value={statusSelectValue}
        onValueChange={(value) =>
          setSelectedStatus(isTrackTimeStatus(value) ? value : null)
        }
        options={statusOptions}
        getOptionLabel={getStatusLabel}
        label={
          <span className="flex items-center gap-1">
            {t("field.status")}
            <InfoIcon className="h-4 w-4 text-muted-foreground" />
          </span>
        }
        labelTitle={t("trackTimeTool.status.description")}
        error={statusError}
      />

      <TrackTimeNoteField
        open={noteOpen}
        onOpenChange={setNoteOpen}
        value={note}
        onChange={setNote}
        placeholder={t("trackTimeTool.note.description", {
          count: TICKET_TRACK_TIME_NOTE_MAX_LENGTH,
        })}
        toggleLabel={t("trackTimeTool.note.toggle")}
        error={noteError}
        describedBy={noteDescribedBy}
      />

      <TrackTimeToolSummary
        currentLabel={t("trackTimeTool.summary.current")}
        totalLabel={t("trackTimeTool.summary.totalAfterSubmit")}
        currentTrackedMinutes={currentTrackedMinutes}
        totalTrackedMinutes={totalTrackedMinutes}
        formatMinutes={(count) => t("trackTimeTool.summary.minutes", { count })}
      />

      <Button type="submit" className="w-full" disabled={disableSubmit}>
        {isPending ? t("action.trackTime.submitting") : submitLabel}
      </Button>
    </form>
  );
}
