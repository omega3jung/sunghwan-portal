"use client";

import type { TFunction } from "i18next";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  RichEditor,
  type RichEditorPresetName,
} from "@/components/custom/RichEditor";
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

const PRESETS: RichEditorPresetName[] = [
  "default",
  "description",
  "comment",
  "action",
];

function createSampleContent(t: TFunction) {
  return `
  <h2>${t("sample.heading")}</h2>
  <p>${t("sample.paragraph")}</p>
  <ul>
    <li>${t("sample.review")}</li>
    <li>${t("sample.record")}</li>
  </ul>
`.trim();
}

export function RichEditorPage() {
  const { t } = useTranslation(NS.demo, { keyPrefix: "richEditor" });
  const sampleContent = useMemo(() => createSampleContent(t), [t]);
  const [value, setValue] = useState(sampleContent);
  const [preset, setPreset] = useState<RichEditorPresetName>("default");
  const [showToolbar, setShowToolbar] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [minHeight, setMinHeight] = useState(208);

  return (
    <div className="flex min-w-0 flex-col gap-8 p-4">
      <FieldGroup>
        <FieldSet>
          <FieldGroup className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <Field className="md:col-span-2">
              <FieldLabel htmlFor="rich-editor-preset">
                {t("preset")}
              </FieldLabel>
              <RadioGroup
                id="rich-editor-preset"
                className="flex flex-wrap gap-4 px-2"
                value={preset}
                onValueChange={(nextPreset) =>
                  setPreset(nextPreset as RichEditorPresetName)
                }
              >
                {PRESETS.map((presetName) => (
                  <div
                    key={presetName}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem value={presetName} />
                    <span>{t(`presets.${presetName}`)}</span>
                  </div>
                ))}
              </RadioGroup>
              <FieldDescription>
                {t("presetDescription")}
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="rich-editor-min-height">
                {t("minimumHeight")}
              </FieldLabel>
              <Input
                id="rich-editor-min-height"
                className="w-28"
                min={120}
                step={8}
                type="number"
                value={minHeight}
                onChange={(event) => {
                  const nextHeight = event.target.valueAsNumber;

                  if (Number.isFinite(nextHeight)) {
                    setMinHeight(Math.max(120, nextHeight));
                  }
                }}
              />
              <FieldDescription>{t("heightInPixels")}</FieldDescription>
            </Field>

            <Field>
              <FieldLabel>{t("editorState")}</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <ToggleField
                  id="rich-editor-toolbar"
                  label={t("toolbar")}
                  checked={showToolbar}
                  onCheckedChange={setShowToolbar}
                />
                <ToggleField
                  id="rich-editor-disabled"
                  label={t("disabled")}
                  checked={disabled}
                  onCheckedChange={setDisabled}
                />
                <ToggleField
                  id="rich-editor-read-only"
                  label={t("readOnly")}
                  checked={readOnly}
                  onCheckedChange={setReadOnly}
                />
                <ToggleField
                  id="rich-editor-error"
                  label={t("error")}
                  checked={hasError}
                  onCheckedChange={setHasError}
                />
              </div>
            </Field>
          </FieldGroup>
        </FieldSet>
      </FieldGroup>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)]">
        <section className="min-w-0 space-y-3 rounded-xl border bg-card p-4">
          <div>
            <h2 className="font-semibold">{t("title")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>

          <RichEditor
            id="rich-editor-demo"
            disabled={disabled}
            error={hasError}
            minHeight={minHeight}
            placeholder={t("placeholder")}
            preset={preset}
            readOnly={readOnly}
            showToolbar={showToolbar}
            value={value}
            onChange={setValue}
          />

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => setValue(sampleContent)}>
              {t("loadSample")}
            </Button>
            <Button type="button" variant="outline" onClick={() => setValue("")}>
              {t("clearContent")}
            </Button>
          </div>
        </section>

        <section className="min-w-0 space-y-3 rounded-xl border bg-muted/30 p-4">
          <div>
            <h2 className="font-semibold">{t("controlledTitle")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("controlledDescription")}
            </p>
          </div>
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap wrap-break-word rounded-lg border bg-background p-3 text-xs leading-5">
            {value || t("empty")}
          </pre>
        </section>
      </div>
    </div>
  );
}

function ToggleField({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-sm">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      {label}
    </label>
  );
}
