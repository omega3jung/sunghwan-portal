"use client";

import { useState } from "react";

import { ColorPicker, DEFAULT_COLOR } from "@/components/custom/ColorPicker";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";

export default function ColorPickerPage() {
  const [color, setColor] = useState(DEFAULT_COLOR);

  return (
    <div className="flex flex-col gap-6 p-4">
      <FieldGroup className="max-w-xl">
        <FieldSet>
          <Field>
            <FieldLabel>Color Picker</FieldLabel>
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
