"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import {
  FileAttachment,
  type FileAttachmentErrorType,
  type FileAttachmentLimitBehavior,
} from "@/components/custom/FileAttachment";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { NS } from "@/lib/application/i18n";

type FileAttachmentDemoForm = {
  files: File[];
};

const LIMIT_BEHAVIORS: FileAttachmentLimitBehavior[] = [
  "accept-available",
  "reject-all",
];

export function FileAttachmentPage() {
  const { t } = useTranslation(NS.demo, { keyPrefix: "fileAttachment" });
  const form = useForm<FileAttachmentDemoForm>({
    defaultValues: { files: [] },
  });
  const files = useWatch({ control: form.control, name: "files" }) ?? [];
  const [maxCount, setMaxCount] = useState(3);
  const [maxSizeMB, setMaxSizeMB] = useState(5);
  const [limitBehavior, setLimitBehavior] =
    useState<FileAttachmentLimitBehavior>("accept-available");
  const [imagesOnly, setImagesOnly] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [lastError, setLastError] =
    useState<FileAttachmentErrorType | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const totalSizeMB = files.reduce((total, file) => total + file.size, 0) /
    (1024 * 1024);
  const accept = imagesOnly
    ? ["image/*"]
    : ["image/*", "application/pdf", "text/plain", ".md"];

  const handleError = (type: FileAttachmentErrorType) => {
    setLastError(type);
    setErrorCount((count) => count + 1);
  };

  return (
    <div className="flex min-w-0 flex-col gap-8 p-4">
      <FieldGroup>
        <FieldSet>
          <FieldGroup className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <Field>
              <FieldLabel htmlFor="attachment-max-count">
                {t("maximumFiles")}
              </FieldLabel>
              <Input
                id="attachment-max-count"
                className="w-28"
                min={1}
                type="number"
                value={maxCount}
                onChange={(event) => {
                  const value = event.target.valueAsNumber;

                  if (Number.isFinite(value)) {
                    setMaxCount(Math.max(1, Math.trunc(value)));
                  }
                }}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="attachment-max-size">
                {t("totalSizeLimit")}
              </FieldLabel>
              <Input
                id="attachment-max-size"
                className="w-28"
                min={1}
                type="number"
                value={maxSizeMB}
                onChange={(event) => {
                  const value = event.target.valueAsNumber;

                  if (Number.isFinite(value)) {
                    setMaxSizeMB(Math.max(1, value));
                  }
                }}
              />
              <FieldDescription>{t("limitInMb")}</FieldDescription>
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel htmlFor="attachment-limit-behavior">
                {t("limitBehavior")}
              </FieldLabel>
              <RadioGroup
                id="attachment-limit-behavior"
                className="flex flex-wrap gap-4 px-2"
                value={limitBehavior}
                onValueChange={(value) =>
                  setLimitBehavior(value as FileAttachmentLimitBehavior)
                }
              >
                {LIMIT_BEHAVIORS.map((behavior) => (
                  <div key={behavior} className="flex items-center space-x-2">
                    <RadioGroupItem value={behavior} />
                    <span>{t(`behaviors.${behavior}`)}</span>
                  </div>
                ))}
              </RadioGroup>
              <FieldDescription>
                {t("limitDescription")}
              </FieldDescription>
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel>{t("attachmentState")}</FieldLabel>
              <div className="flex flex-wrap gap-5">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={imagesOnly}
                    onCheckedChange={setImagesOnly}
                  />
                  {t("imagesOnly")}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={readOnly}
                    onCheckedChange={setReadOnly}
                  />
                  {t("readOnly")}
                </label>
              </div>
            </Field>
          </FieldGroup>
        </FieldSet>
      </FieldGroup>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(280px,1fr)]">
        <section className="min-w-0 space-y-4 rounded-xl border bg-card p-4">
          <div>
            <h2 className="font-semibold">{t("title")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>

          <FileAttachment
            accept={accept}
            form={form}
            limitBehavior={limitBehavior}
            maxCount={maxCount}
            maxSizeMB={maxSizeMB}
            name="files"
            readOnly={readOnly}
            onError={handleError}
          />

          <Button
            type="button"
            variant="outline"
            disabled={files.length === 0}
            onClick={() => form.setValue("files", [])}
          >
            {t("clearFiles")}
          </Button>
        </section>

        <section className="space-y-4 rounded-xl border bg-muted/30 p-4">
          <div>
            <h2 className="font-semibold">{t("formState")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("formDescription")}
            </p>
          </div>

          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">{t("files")}</dt>
            <dd>{files.length}</dd>
            <dt className="text-muted-foreground">{t("totalSize")}</dt>
            <dd>{totalSizeMB.toFixed(3)} MB</dd>
            <dt className="text-muted-foreground">{t("lastError")}</dt>
            <dd>{lastError ? t(`errors.${lastError}`) : t("none")}</dd>
            <dt className="text-muted-foreground">{t("errorCount")}</dt>
            <dd>{errorCount}</dd>
          </dl>

          <div className="space-y-2">
            {files.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noFiles")}</p>
            ) : (
              files.map((file) => (
                <div key={`${file.name}-${file.size}-${file.lastModified}`}>
                  <p className="truncate text-sm font-medium" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {file.type || t("unknownType")} · {t("fileSize", {
                      size: file.size,
                    })}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
