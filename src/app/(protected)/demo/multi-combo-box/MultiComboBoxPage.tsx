"use client";

import type { TFunction } from "i18next";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  type ButtonVariant,
  MultiComboBox,
  TreeMultiComboBox,
  type TreeMultiComboBoxOption,
} from "@/components/custom/MultiComboBox";
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
import {
  buttonVariantData,
  comboBoxVariantData,
  multiComboBoxMocks,
  treeMultiComboBoxMocks,
} from "@/mocks/ui/demo/multi-combo-box";

import { comboBoxVariant, indexVariant } from "./type";

export function MultiComboBoxPage() {
  const { t } = useTranslation(NS.demo, { keyPrefix: "multiComboBox" });
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
  const monthOptions = useMemo(
    () =>
      multiComboBoxMocks.map((option) => ({
        ...option,
        label: t(`months.${option.value}`),
      })),
    [t],
  );
  const treeOptions = useMemo(
    () => localizeTreeOptions(treeMultiComboBoxMocks, t),
    [t],
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      <FieldGroup>
        <FieldSet>
          <FieldGroup className="grid grid-cols-4">
            <Field className="col-span-4">
              <FieldLabel htmlFor="combo-box-variants-radio">
                {t("comboVariants")}
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
                    <h6>{t(`variants.${variant}`)}</h6>
                  </div>
                ))}
              </RadioGroup>
            </Field>

            <Field className="col-span-4">
              <FieldLabel htmlFor="button-variants-radio">
                {t("buttonVariants")}
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
                    <h6>{t(`variants.${variant}`)}</h6>
                  </div>
                ))}
              </RadioGroup>
            </Field>

            <Field>
              <FieldLabel htmlFor="palette-start-input">
                {t("paletteStart")}
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
              <FieldDescription>{t("paletteStartDescription")}</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="palette-pick-input">
                {t("palettePick")}
              </FieldLabel>
              <Input
                id="palette-pick-input"
                placeholder={t("palettePickPlaceholder")}
                className="w-20"
                value={palettePick ?? ""}
                onChange={(e) =>
                  setPalettePick(
                    e.target.value === "" ? undefined : e.target.valueAsNumber,
                  )
                }
                type={"number"}
                min={1}
                max={10}
              />
              <FieldDescription>{t("palettePickDescription")}</FieldDescription>
            </Field>
          </FieldGroup>
        </FieldSet>
      </FieldGroup>

      <div className="max-w-sm">
        <h4 className="py-2">{t("multiTitle")}</h4>
        <MultiComboBox
          variant={comboBoxVariant}
          badgeVariant={badgeVariant}
          paletteStart={paletteStart as indexVariant}
          palettePick={palettePick as indexVariant}
          options={monthOptions}
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
        <h4 className="py-2">{t("treeTitle")}</h4>
        <TreeMultiComboBox
          variant={comboBoxVariant}
          badgeVariant={badgeVariant}
          paletteStart={paletteStart as indexVariant}
          palettePick={palettePick as indexVariant}
          options={treeOptions}
          value={selectedRanges}
          onChange={setSelectedRanges}
        />
      </div>
    </div>
  );
}

function localizeTreeOptions(
  options: TreeMultiComboBoxOption[],
  t: TFunction,
): TreeMultiComboBoxOption[] {
  return options.map((option) => ({
    ...option,
    label: t(`items.${option.value}`),
    children: option.children.map((child) => ({
      ...child,
      label: t(`items.${child.value}`),
    })),
  }));
}
