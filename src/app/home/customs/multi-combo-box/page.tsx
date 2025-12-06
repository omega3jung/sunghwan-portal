"use client";

import { VariantProps } from "class-variance-authority";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  ButtonVariant,
  comboBoxVariants,
  MultiComboBox,
} from "@/components/custom/MultiComboBox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ValueLabel } from "@/types/common";

type comboBoxVariant = VariantProps<typeof comboBoxVariants>["variant"];
type indexVariant = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export default function MultiComboBoxPage() {
  const [choise, setChoise] = useState<Array<string>>([
    "January",
    "February",
    "March",
  ]);
  const [rainbowStart, setRainboStart] = useState<number>(1);
  const [rainbowPick, setRainbowPick] = useState<number>();

  const [comboBoxVariant, setComboBoxVariant] =
    useState<comboBoxVariant>("default");
  const [buttonVariant, setButtonVariant] = useState<ButtonVariant>("rainbow");

  const comboBoxVariantData = ["default", "ghost"];
  const buttonVariantData = [
    "default",
    "secondary",
    "overdue",
    "destructive",
    "outline",
    "rainbow",
  ];

  const testData = useMemo<Array<ValueLabel>>(() => {
    const keys = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
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
          value={choise}
          onSelect={(selected: string) => {
            setChoise([...choise, selected]);
          }}
          onRemove={(selected: string) => {
            const newChoise = choise?.filter((value) => value !== selected);

            setChoise(newChoise);
          }}
        />
      </div>
    </div>
  );
}
