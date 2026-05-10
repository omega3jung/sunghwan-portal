"use client";

import type { ReactNode } from "react";

import { DateTimePicker } from "@/components/custom/DatePicker";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatFormDateTime, parseFormDateTime } from "@/shared/utils/format";
import { cn } from "@/shared/utils/presentation";

const TRACK_TIME_FIELD_GRID_CLASS_NAME =
  "grid grid-cols-1 gap-y-1 sm:grid-cols-[110px_minmax(0,1fr)] sm:items-start sm:gap-x-2";

type CompactFieldRowProps = {
  htmlFor?: string;
  label: ReactNode;
  labelTitle?: string;
  children: ReactNode;
  error?: ReactNode;
  className?: string;
  labelClassName?: string;
  contentClassName?: string;
};

type TrackTimeDurationFieldProps = {
  value: unknown;
  onChange: (value: string) => void;
  error?: string;
  label: string;
  placeholder: string;
};

type TrackTimeDateTimeFieldProps = {
  id: string;
  label: string;
  value?: string | null;
  onChange: (value: string) => void;
  error?: string;
};

type TrackTimeStatusFieldProps = {
  value?: string;
  onValueChange: (value: string) => void;
  options: readonly string[];
  getOptionLabel: (value: string) => string;
  label: ReactNode;
  labelTitle?: string;
  error?: string;
};

type TrackTimeNoteFieldProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  toggleLabel: string;
  error?: string;
  describedBy?: string;
};

export function CompactFieldRow({
  htmlFor,
  label,
  labelTitle,
  children,
  error,
  className,
  labelClassName,
  contentClassName,
}: CompactFieldRowProps) {
  const errorId = error && htmlFor ? `${htmlFor}-error` : undefined;

  return (
    <div className={cn(TRACK_TIME_FIELD_GRID_CLASS_NAME, className)}>
      <label
        htmlFor={htmlFor}
        title={labelTitle}
        className={cn(
          "text-sm font-medium leading-snug text-foreground data-[invalid=true]:text-destructive sm:pt-2",
          labelClassName,
        )}
        data-invalid={Boolean(error)}
      >
        {label}
      </label>

      <div className={cn("min-w-0", contentClassName)}>{children}</div>

      {error ? (
        <div
          id={errorId}
          role="alert"
          className="text-sm text-destructive sm:col-start-2"
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}

export function TrackTimeDurationField({
  value,
  onChange,
  error,
  label,
  placeholder,
}: TrackTimeDurationFieldProps) {
  return (
    <CompactFieldRow
      htmlFor="ticket-track-duration-minutes"
      label={label}
      error={error}
    >
      <Input
        id="ticket-track-duration-minutes"
        value={
          typeof value === "number" || typeof value === "string" ? value : ""
        }
        onChange={(event) => onChange(event.target.value)}
        type="number"
        inputMode="numeric"
        min={1}
        step={1}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? "ticket-track-duration-minutes-error" : undefined
        }
      />
    </CompactFieldRow>
  );
}

export function TrackTimeDateTimeField({
  id,
  label,
  value,
  onChange,
  error,
}: TrackTimeDateTimeFieldProps) {
  return (
    <CompactFieldRow htmlFor={id} label={label} error={error}>
      <DateTimePicker
        id={id}
        value={parseFormDateTime(value)}
        onChange={(date) => onChange(formatFormDateTime(date))}
        compact
        minuteStep={5}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
    </CompactFieldRow>
  );
}

export function TrackTimeStatusField({
  value,
  onValueChange,
  options,
  getOptionLabel,
  label,
  labelTitle,
  error,
}: TrackTimeStatusFieldProps) {
  return (
    <CompactFieldRow
      htmlFor="ticket-track-status"
      label={label}
      labelTitle={labelTitle}
      error={error}
    >
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id="ticket-track-status"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "ticket-track-status-error" : undefined}
        >
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          {options.map((status) => (
            <SelectItem key={status} value={status}>
              {getOptionLabel(status)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </CompactFieldRow>
  );
}

export function TrackTimeNoteField({
  open,
  onOpenChange,
  value,
  onChange,
  placeholder,
  toggleLabel,
  error,
  describedBy,
}: TrackTimeNoteFieldProps) {
  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      className="rounded-lg border border-border/50 bg-muted/20"
    >
      <CollapsibleTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="flex w-full justify-between px-3 text-xs"
        >
          {toggleLabel}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-2 px-3 pb-3">
        <div className="space-y-2">
          <Textarea
            id="ticket-track-note"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            rows={3}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
          />

          {error ? (
            <p
              id="ticket-track-note-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
