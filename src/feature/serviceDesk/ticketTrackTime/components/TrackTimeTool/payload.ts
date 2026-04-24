import type {
  TicketTrackTimeInputMode,
  TicketTrackTimeStatus,
  TicketTrackTimeSubmitPayload,
} from "../../types";

const MS_PER_MINUTE = 60 * 1000;

type TrackTimeDurationLike = {
  durationMinutes?: unknown;
};

type TrackTimeRangeLike = {
  startAt?: string | null;
  endAt?: string | null;
};

type GetCurrentTrackedMinutesParams = {
  inputMode: TicketTrackTimeInputMode;
  durationValues?: TrackTimeDurationLike;
  rangeValues?: TrackTimeRangeLike;
};

type CanChangeStatusParams = {
  previousTrackedMinutes: number;
  currentTrackedMinutes: number;
};

type GetSubmitPayloadParams = {
  ticketId: string;
  inputMode: TicketTrackTimeInputMode;
  durationValues?: TrackTimeDurationLike;
  rangeValues?: TrackTimeRangeLike;
  nextStatus?: TicketTrackTimeStatus;
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

export function getTrackedMinutesFromDuration(values?: TrackTimeDurationLike) {
  const durationMinutes = Number(values?.durationMinutes);

  if (!Number.isFinite(durationMinutes) || !Number.isInteger(durationMinutes)) {
    return 0;
  }

  return durationMinutes > 0 ? durationMinutes : 0;
}

export function getTrackedMinutesFromRange(values?: TrackTimeRangeLike) {
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
    ? getTrackedMinutesFromDuration(durationValues)
    : getTrackedMinutesFromRange(rangeValues);
}

export function canChangeStatus({
  previousTrackedMinutes,
  currentTrackedMinutes,
}: CanChangeStatusParams) {
  return previousTrackedMinutes + currentTrackedMinutes > 0;
}

export function getTrackTimeSubmitPayload({
  ticketId,
  inputMode,
  durationValues,
  rangeValues,
  nextStatus,
  note,
}: GetSubmitPayloadParams): TicketTrackTimeSubmitPayload {
  const trackedMinutes = getCurrentTrackedMinutes({
    inputMode,
    durationValues,
    rangeValues,
  });
  const payloadBase = {
    ticketId,
    inputMode,
    trackedMinutes,
    nextStatus,
    note: normalizeNote(note),
  };

  if (inputMode === "duration") {
    return {
      ...payloadBase,
      durationMinutes: getTrackedMinutesFromDuration(durationValues),
    };
  }

  if (!rangeValues?.startAt || !rangeValues.endAt) {
    return payloadBase;
  }

  return {
    ...payloadBase,
    startAt: toIsoString(rangeValues.startAt),
    endAt: toIsoString(rangeValues.endAt),
  };
}
