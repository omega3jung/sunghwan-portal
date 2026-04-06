"use client";

import { useState } from "react";

import {
  buttonVariantData,
  comboBoxVariantData,
  multiComboBoxMocks,
  treeMultiComboBoxMocks,
} from "@/app/_mocks/ui/demo/multi-combo-box";
import {
  type ButtonVariant,
  MultiComboBox,
  TreeMultiComboBox,
} from "@/components/custom/MultiComboBox";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { comboBoxVariant, indexVariant } from "./type";

export default function MultiComboBoxPage() {
  const [selectedRanges, setSelectedRanges] = useState<string[]>([
    "January",
    "February",
    "March",
  ]);
  const [paletteStart, setPaletteStart] = useState<number>(1);
  const [palettePick, setPalettePick] = useState<number>();

  const [comboBoxVariant, setComboBoxVariant] =
    useState<comboBoxVariant>("default");
  const [badgeVariant, setBadgeVariant] = useState<ButtonVariant>("palette");

  return (
    <div className="flex flex-col gap-4 p-4">
      <FieldGroup>
        <FieldSet>
          <FieldGroup className="grid grid-cols-4">
            <Field className="col-span-4">
              <FieldLabel htmlFor="combo-box-variants-radio">
                Combo Box Variants
              </FieldLabel>
              <RadioGroup
                id="combo-box-variants-radio"
                className="flex px-2"
                value={comboBoxVariant as string}
                onValueChange={(value) =>
                  setComboBoxVariant(value as comboBoxVariant)
                }
              >
                {comboBoxVariantData.map((variant) => (
                  <div key={variant} className="flex items-center space-x-2">
                    <RadioGroupItem value={variant} />
                    <h6>{variant}</h6>
                  </div>
                ))}
              </RadioGroup>
            </Field>

            <Field className="col-span-4">
              <FieldLabel htmlFor="button-variants-radio">
                Button Variants
              </FieldLabel>
              <RadioGroup
                id="button-variants-radio"
                className="flex px-2"
                value={badgeVariant as string}
                onValueChange={(value) =>
                  setBadgeVariant(value as ButtonVariant)
                }
              >
                {buttonVariantData.map((variant) => (
                  <div key={variant} className="flex items-center space-x-2">
                    <RadioGroupItem value={variant} />
                    <h6>{variant}</h6>
                  </div>
                ))}
              </RadioGroup>
            </Field>

            <Field>
              <FieldLabel htmlFor="palette-start-input">
                Palette Start
              </FieldLabel>
              <Input
                id="palette-start-input"
                className="w-20"
                value={paletteStart}
                onChange={(e) => setPaletteStart(parseInt(e.target.value))}
                type={"number"}
                min={1}
                max={10}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="palette-pick-input">Palette Pick</FieldLabel>
              <Input
                id="palette-pick-input"
                className="w-20"
                value={palettePick}
                onChange={(e) => setPalettePick(parseInt(e.target.value))}
                type={"number"}
                min={1}
                max={10}
              />
            </Field>
          </FieldGroup>
        </FieldSet>
      </FieldGroup>

      <div className="max-w-sm">
        <h4 className="py-2">Multi ComboBox</h4>
        <MultiComboBox
          variant={comboBoxVariant}
          badgeVariant={badgeVariant}
          paletteStart={paletteStart as indexVariant}
          palettePick={palettePick as indexVariant}
          options={multiComboBoxMocks}
          value={selectedRanges}
          onSelect={(selected: string) => {
            setSelectedRanges([...selectedRanges, selected]);
          }}
          onRemove={(selected: string) => {
            const newChoice = selectedRanges?.filter(
              (value) => value !== selected,
            );

            setSelectedRanges(newChoice);
          }}
        />
      </div>

      <div className="max-w-sm">
        <h4 className="py-2">Tree Multi ComboBox</h4>
        <TreeMultiComboBox
          variant={comboBoxVariant}
          badgeVariant={badgeVariant}
          paletteStart={paletteStart as indexVariant}
          palettePick={palettePick as indexVariant}
          options={treeMultiComboBoxMocks}
          value={selectedRanges}
          onChange={setSelectedRanges}
        />
      </div>
    </div>
  );
}
