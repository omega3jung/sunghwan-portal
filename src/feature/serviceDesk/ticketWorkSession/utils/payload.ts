import { normalizeNonNegativeInteger } from "@/shared/utils/value";

import type {
  TicketWorkSessionInputMode,
  TicketWorkSessionStatus,
  TicketWorkSessionSubmitPayload,
} from "../types";

const MS_PER_MINUTE = 60 * 1000;

type WorkSessionDurationLike = {
  durationMinutes?: unknown;
};

type WorkSessionRangeLike = {
  startAt?: string | null;
  endAt?: string | null;
};

type GetCurrentTrackedMinutesParams = {
  inputMode: TicketWorkSessionInputMode;
  durationValues?: WorkSessionDurationLike;
  rangeValues?: WorkSessionRangeLike;
};

type CanChangeStatusParams = {
  previousTrackedMinutes: number;
  currentTrackedMinutes: number;
};

type GetSubmitPayloadParams = {
  ticketId: string;
  inputMode: TicketWorkSessionInputMode;
  durationValues?: WorkSessionDurationLike;
  rangeValues?: WorkSessionRangeLike;
  nextStatus?: TicketWorkSessionStatus;
  note?: string;
};

const parseTime = (value?: string | null) => {
  if (!value) {
    return Number.NaN;
  }

  return new Date(value).getTime();
};

const toIsoString = (value: string) => new Date(value).toISOString();

const normalizeNote = (note?: string) => {
  const trimmedNote = note?.trim();
  return trimmedNote ? trimmedNote : undefined;
};

const getDurationTimeRange = (durationMinutes: number) => {
  const endAt = new Date();
  const startAt = new Date(endAt.getTime() - durationMinutes * MS_PER_MINUTE);

  return {
    startAt: startAt.toISOString(),
    endAt: endAt.toISOString(),
  };
};

export function getTrackedMinutesFromRange(values?: WorkSessionRangeLike) {
  const start = parseTime(values?.startAt);
  const end = parseTime(values?.endAt);

  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return 0;
  }

  return Math.floor((end - start) / MS_PER_MINUTE);
}

export function getCurrentTrackedMinutes({
  inputMode,
  durationValues,
  rangeValues,
}: GetCurrentTrackedMinutesParams) {
  return inputMode === "duration"
    ? normalizeNonNegativeInteger(durationValues?.durationMinutes)
    : getTrackedMinutesFromRange(rangeValues);
}

export function canChangeStatus({
  previousTrackedMinutes,
  currentTrackedMinutes,
}: CanChangeStatusParams) {
  return (
    normalizeNonNegativeInteger(previousTrackedMinutes) +
      normalizeNonNegativeInteger(currentTrackedMinutes) >
    0
  );
}

export function getWorkSessionSubmitPayload({
  ticketId,
  inputMode,
  durationValues,
  rangeValues,
  nextStatus,
  note,
}: GetSubmitPayloadParams): TicketWorkSessionSubmitPayload {
  const payloadBase = {
    ticketId,
    inputMode,
    nextStatus,
    note: normalizeNote(note),
  };

  if (inputMode === "duration") {
    const durationMinutes = normalizeNonNegativeInteger(
      durationValues?.durationMinutes,
    );

    return {
      ...payloadBase,
      durationMinutes,
      ...getDurationTimeRange(durationMinutes),
    };
  }

  if (!rangeValues?.startAt || !rangeValues.endAt) {
    return {
      ...payloadBase,
      durationMinutes: getTrackedMinutesFromRange(rangeValues),
    };
  }

  return {
    ...payloadBase,
    durationMinutes: getTrackedMinutesFromRange(rangeValues),
    startAt: toIsoString(rangeValues.startAt),
    endAt: toIsoString(rangeValues.endAt),
  };
}
