"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ColorPicker, DEFAULT_COLOR } from "@/components/custom/ColorPicker";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { NS } from "@/lib/application/i18n";

export function ColorPickerPage() {
  const { t } = useTranslation(NS.demo, { keyPrefix: "colorPicker" });
  const [color, setColor] = useState(DEFAULT_COLOR);

  return (
    <div className="flex flex-col gap-6 p-4">
      <FieldGroup className="max-w-xl">
        <FieldSet>
          <Field>
            <FieldLabel>{t("title")}</FieldLabel>
            <ColorPicker
              value={color}
              onChange={setColor}
              defaultValue={DEFAULT_COLOR}
            >
              <ColorPicker.Trigger />
              <ColorPicker.HexInput />
              <ColorPicker.Reset />
            </ColorPicker>
          </Field>
        </FieldSet>
      </FieldGroup>
    </div>
  );
}
