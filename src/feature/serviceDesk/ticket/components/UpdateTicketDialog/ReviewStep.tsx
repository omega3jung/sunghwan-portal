"use client";

import { format } from "date-fns";
import { FileText, ImageIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import type {
  TicketAttachmentMetadata,
  TicketDetail,
} from "@/domain/serviceDesk";
import {
  MAX_ATTACH_COUNT,
  MAX_ATTACH_SIZE,
} from "@/feature/serviceDesk/ticket/constants";
import type { TicketFormValues } from "@/feature/serviceDesk/ticket/forms";
import {
  formatTicketCategoryPath,
  resolveTicketCategoryMeta,
} from "@/feature/serviceDesk/ticket/utils/categorySelection";
import { useLocalizedText } from "@/lib/client/i18n";
import { NS } from "@/lib/i18n";
import { bytesToKB } from "@/shared/utils/browser";

import { useTicketUpdateFormContext } from "../../context/TicketUpdateFormContext";
import { RoutingRecalculationNotice } from "./RemoteNotices";

export function ReviewStep() {
  const { form, ticket, categories, language, existingFiles, existingImages } =
    useTicketUpdateFormContext();
  const { t } = useTranslation(NS.serviceDesk);
  const tLocal = useLocalizedText(language);
  const values = form.watch();
  const categoryDisplayValue = formatTicketCategoryPath(
    resolveTicketCategoryMeta(categories, values.category),
    tLocal,
    values.category || "-",
  );
  const totalFileSizeMB = (
    values.attachment.reduce((sum, file) => sum + file.size, 0) /
    1024 /
    1024
  ).toFixed(2);
  const shouldShowRoutingRecalculationNotice =
    !!ticket &&
    hasRoutingSensitiveChanges({
      ticket,
      values,
      existingFiles,
      existingImages,
    });

  return (
    <FieldGroup className="min-w-0">
      <RoutingRecalculationNotice
        isVisible={shouldShowRoutingRecalculationNotice}
      >
        {t("ticketUpdate.routing.reset")}
      </RoutingRecalculationNotice>

      <Field className="min-w-0 gap-1">
        <FieldLabel>{t("field.category", { ns: NS.common })}</FieldLabel>
        <ReadOnlyValue>{categoryDisplayValue}</ReadOnlyValue>
      </Field>

      <Field className="min-w-0 gap-1">
        <FieldLabel>{t("field.subject", { ns: NS.common })}</FieldLabel>
        <ReadOnlyValue>{values.subject || "-"}</ReadOnlyValue>
      </Field>

      <Field className="min-w-0 gap-1">
        <FieldLabel>{t("field.dueAt", { ns: NS.common })}</FieldLabel>
        <ReadOnlyValue>{format(values.dueAt, "PPP")}</ReadOnlyValue>
      </Field>

      <Field className="min-w-0 gap-1">
        <FieldLabel>{t("field.email", { ns: NS.common })}</FieldLabel>
        <ReadOnlyValue>{formatEmailSummary(values.email, t)}</ReadOnlyValue>
      </Field>

      <Field className="min-w-0 gap-1">
        <FieldLabel>{t("field.description", { ns: NS.common })}</FieldLabel>
        <div className="max-w-full overflow-x-auto">
          <div
            className="prose prose-sm min-h-52 min-w-0 max-w-none break-words rounded-md border border-input bg-transparent px-3 py-2 text-foreground prose-a:text-primary prose-img:max-w-full prose-img:rounded-lg prose-p:my-3 prose-p:leading-6 prose-pre:max-w-full prose-pre:overflow-x-auto"
            dangerouslySetInnerHTML={{
              __html: values.body || "<p>-</p>",
            }}
          />
        </div>
      </Field>

      <Field className="min-w-0">
        <Separator className="mb-4 mt-2 h-0.5" />
        <ReviewAttachmentSummary
          files={existingFiles}
          images={existingImages}
        />
      </Field>

      <Field className="min-w-0">
        <FieldLabel>{t("ticketUpdate.field.newAttachments")}</FieldLabel>
        <div className="max-h-48 space-y-2 overflow-y-auto">
          {values.attachment.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              {t("ticketUpdate.empty.newAttachments")}
            </div>
          ) : null}
          {values.attachment.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex min-w-0 items-center justify-between rounded-md border px-3 py-2"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{file.name}</div>
                <div className="text-xs text-muted-foreground">
                  {bytesToKB(file.size)} KB
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between text-sm text-muted-foreground">
          <span>
            {values.attachment.length}/{MAX_ATTACH_COUNT}
          </span>
          <span>
            {totalFileSizeMB}/{MAX_ATTACH_SIZE} MB
          </span>
        </div>
      </Field>
    </FieldGroup>
  );
}

function hasRoutingSensitiveChanges({
  ticket,
  values,
  existingFiles,
  existingImages,
}: {
  ticket: TicketDetail;
  values: TicketFormValues;
  existingFiles: TicketAttachmentMetadata[];
  existingImages: TicketAttachmentMetadata[];
}) {
  if ((values.category ?? "") !== ticket.categoryId) {
    return true;
  }

  if (values.subject.trim() !== ticket.subject) {
    return true;
  }

  if (values.body.trim() !== ticket.content) {
    return true;
  }

  if (values.attachment.length > 0) {
    return true;
  }

  return (
    !hasSameAttachments(existingFiles, ticket.files) ||
    !hasSameAttachments(existingImages, ticket.images)
  );
}

function hasSameAttachments(
  current: TicketAttachmentMetadata[],
  original: TicketAttachmentMetadata[],
) {
  return (
    JSON.stringify(getAttachmentComparisonKeys(current)) ===
    JSON.stringify(getAttachmentComparisonKeys(original))
  );
}

function getAttachmentComparisonKeys(items: TicketAttachmentMetadata[]) {
  return items
    .map((item) =>
      [
        item.replacedName,
        item.originalName,
        item.extension,
        String(item.size),
        item.type,
        item.demoUrl,
        item.reason,
      ].join("|"),
    )
    .sort();
}

function formatEmailSummary(
  email: TicketFormValues["email"],
  t: ReturnType<typeof useTranslation>["t"],
) {
  const rows = [
    [t("field.emailTo", { ns: NS.common }), email.to],
    [t("field.emailCc", { ns: NS.common }), email.cc],
    [t("field.emailBcc", { ns: NS.common }), email.bcc],
  ].filter(([, values]) => Array.isArray(values) && values.length > 0);

  if (rows.length === 0) {
    return "-";
  }

  return rows
    .map(([label, values]) => `${label}: ${(values as string[]).join(", ")}`)
    .join("; ");
}

function ReadOnlyValue({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-9 min-w-0 items-center rounded-md border border-input bg-muted/20 px-3 py-2 text-sm break-words">
      {children}
    </div>
  );
}

type ReviewAttachmentSummaryProps = {
  files: TicketAttachmentMetadata[];
  images: TicketAttachmentMetadata[];
};

function ReviewAttachmentSummary({
  files,
  images,
}: ReviewAttachmentSummaryProps) {
  const { t } = useTranslation(NS.serviceDesk);

  if (files.length === 0 && images.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        {t("ticketUpdate.empty.existingAttachments")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {images.length > 0 ? (
        <ReviewAttachmentGroup
          items={images}
          label={t("ticketUpdate.field.existingImages")}
          icon={<ImageIcon className="h-4 w-4" />}
          image
        />
      ) : null}
      {files.length > 0 ? (
        <ReviewAttachmentGroup
          items={files}
          label={t("ticketUpdate.field.existingFiles")}
          icon={<FileText className="h-4 w-4" />}
        />
      ) : null}
    </div>
  );
}

type ReviewAttachmentGroupProps = {
  items: TicketAttachmentMetadata[];
  label: string;
  icon: ReactNode;
  image?: boolean;
};

function ReviewAttachmentGroup({
  items,
  label,
  icon,
  image = false,
}: ReviewAttachmentGroupProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <a
            key={`${item.replacedName}-${index}`}
            href={item.demoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex max-w-full items-center gap-2 rounded-md border px-3 py-2 text-sm"
          >
            {image ? <ImageIcon className="h-4 w-4" /> : icon}
            <span className="truncate">{item.originalName}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
