import type {
  TicketWorkSessionInputMode,
  TicketWorkSessionStatus,
  TicketWorkSessionSubmitPayload,
} from "../../types";

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

export function getTrackedMinutesFromDuration(values?: WorkSessionDurationLike) {
  const durationMinutes = Number(values?.durationMinutes);

  if (!Number.isFinite(durationMinutes) || !Number.isInteger(durationMinutes)) {
    return 0;
  }

  return durationMinutes > 0 ? durationMinutes : 0;
}

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
    ? getTrackedMinutesFromDuration(durationValues)
    : getTrackedMinutesFromRange(rangeValues);
}

export function canChangeStatus({
  previousTrackedMinutes,
  currentTrackedMinutes,
}: CanChangeStatusParams) {
  return previousTrackedMinutes + currentTrackedMinutes > 0;
}

export function getWorkSessionSubmitPayload({
  ticketId,
  inputMode,
  durationValues,
  rangeValues,
  nextStatus,
  note,
}: GetSubmitPayloadParams): TicketWorkSessionSubmitPayload {
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
