"use client";

import { useMemo, useState } from "react";

import {
  buttonVariantData,
  comboBoxVariantData,
  keys,
} from "@/app/_mocks/pages/demo/multi-combo-box";
import {
  type ButtonVariant,
  MultiComboBox,
} from "@/components/custom/MultiComboBox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ValueLabel } from "@/shared/types";

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

  const testData = useMemo<ValueLabel[]>(() => {
    const keyData = keys.map((key) => {
      return { value: key, label: key } as ValueLabel;
    });

    return keyData;
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="p-2">Combo Box Variants</h4>
        <RadioGroup
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
      </div>

      <div>
        <h4 className="p-2">Button Variants</h4>
        <RadioGroup
          className="flex px-2"
          value={badgeVariant as string}
          onValueChange={(value) => setBadgeVariant(value as ButtonVariant)}
        >
          {buttonVariantData.map((variant) => (
            <div key={variant} className="flex items-center space-x-2">
              <RadioGroupItem value={variant} />
              <h6>{variant}</h6>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <h4 className="p-2">Palette Options</h4>
        <div className="flex items-center gap-4 px-2">
          <h6>Palette Start</h6>
          <Input
            className="w-20"
            value={paletteStart}
            onChange={(e) => setPaletteStart(parseInt(e.target.value))}
            type={"number"}
            min={1}
            max={10}
          />
          <h6>Palette Pick</h6>
          <Input
            className="w-20"
            value={palettePick}
            onChange={(e) => setPalettePick(parseInt(e.target.value))}
            type={"number"}
            min={1}
            max={10}
          />
        </div>
      </div>

      <div className="max-w-sm p-2">
        <MultiComboBox
          variant={comboBoxVariant}
          badgeVariant={badgeVariant}
          paletteStart={paletteStart as indexVariant}
          palettePick={palettePick as indexVariant}
          options={testData}
          value={selectedRanges}
          onSelect={(selected: string) => {
            setSelectedRanges([...selectedRanges, selected]);
          }}
          onRemove={(selected: string) => {
            const newChoise = selectedRanges?.filter(
              (value) => value !== selected,
            );

            setSelectedRanges(newChoise);
          }}
        />
      </div>
    </div>
  );
}
