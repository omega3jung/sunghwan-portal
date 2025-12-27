"use client";

import { useMemo, useState } from "react";

import {
  ButtonVariant,
  MultiComboBox,
} from "@/components/custom/MultiComboBox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ValueLabel } from "@/types/common";

import { buttonVariantData, comboBoxVariantData, keys } from "./mock";
import { comboBoxVariant, indexVariant } from "./type";

export default function MultiComboBoxPage() {
  const [selectedRanges, setSelectedRanges] = useState<Array<string>>([
    "January",
    "February",
    "March",
  ]);
  const [rainbowStart, setRainboStart] = useState<number>(1);
  const [rainbowPick, setRainbowPick] = useState<number>();

  const [comboBoxVariant, setComboBoxVariant] =
    useState<comboBoxVariant>("default");
  const [buttonVariant, setButtonVariant] = useState<ButtonVariant>("rainbow");

  const testData = useMemo<Array<ValueLabel>>(() => {
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
          value={buttonVariant as string}
          onValueChange={(value) => setButtonVariant(value as ButtonVariant)}
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
        <h4 className="p-2">Rainbow Options</h4>
        <div className="flex items-center gap-4 px-2">
          <h6>rainbowStart</h6>
          <Input
            className="w-20"
            value={rainbowStart}
            onChange={(e) => setRainboStart(parseInt(e.target.value))}
            type={"number"}
            min={1}
            max={10}
          />
          <h6>rainbowPick</h6>
          <Input
            className="w-20"
            value={rainbowPick}
            onChange={(e) => setRainbowPick(parseInt(e.target.value))}
            type={"number"}
            min={1}
            max={10}
          />
        </div>
      </div>

      <div className="max-w-sm p-2">
        <MultiComboBox
          variant={comboBoxVariant}
          buttonVariant={buttonVariant}
          rainbowStart={rainbowStart as indexVariant}
          rainbowPick={rainbowPick as indexVariant}
          options={testData}
          value={selectedRanges}
          onSelect={(selected: string) => {
            setSelectedRanges([...selectedRanges, selected]);
          }}
          onRemove={(selected: string) => {
            const newChoise = selectedRanges?.filter(
              (value) => value !== selected
            );

            setSelectedRanges(newChoise);
          }}
        />
      </div>
    </div>
  );
}
