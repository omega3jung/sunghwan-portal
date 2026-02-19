"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  labelPositionData,
  orientationData,
  stepColorData,
  stepperMock,
  stepVariantData,
} from "@/app/_mocks/pages/demo/stepper";
import { Stepper } from "@/components/custom/Stepper";
import {
  LabelPosition,
  Orientation,
  StepColor,
  StepVariant,
} from "@/components/custom/Stepper/StepperContext";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useLanguageState } from "@/services/language";
import { cn } from "@/utils";

export default function AvatarMultiComboBoxPage() {
  const { t } = useTranslation("demo");
  const { language } = useLanguageState();

  const [currentStep, setCurrentStep] = useState(1);
  const [orientation, setOrientation] = useState<Orientation>("horizontal");
  const [stepVariant, setStepVariant] = useState<StepVariant>("square");
  const [labelPosition, setLabelPosition] = useState<LabelPosition>("left");
  const [stepColor, setStepColor] = useState<StepColor>("primary");

  const [showStepOrderLabel, setShowStepOrderLabel] = useState<boolean>(true);
  const [startIndex, setStartIndex] = useState<number>(1);

  const demoSteps = useMemo<{ label: string }[]>(() => {
    return stepperMock.map((step, idx) => {
      if (showStepOrderLabel) {
        if (language === "ko") {
          return {
            label: `${idx + startIndex} ${t("stepper.step")} - ${step.label}`,
          };
        }
        return {
          label: `${t("stepper.step")} ${idx + startIndex} - ${step.label}`,
        };
      }
      return step;
    });
  }, [language, showStepOrderLabel, startIndex, t]);

  return (
    <div className="flex flex-col">
      <h4 className="p-2">{t("stepper.variants")}</h4>
      <FieldGroup className="mt-4 p-2">
        <FieldSet>
          <FieldGroup className="flex flex-row">
            <Field>
              <FieldLabel htmlFor="orientation-radio">
                {t("stepper.orientation")}
              </FieldLabel>
              <RadioGroup
                id="orientation-radio"
                className="flex px-2"
                value={orientation as string}
                onValueChange={(value) => setOrientation(value as Orientation)}
              >
                {orientationData.map((variant) => (
                  <div key={variant} className="flex items-center space-x-2">
                    <RadioGroupItem value={variant} />
                    <h6>{variant}</h6>
                  </div>
                ))}
              </RadioGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="step-variant-radio">
                {t("stepper.stepVariant")}
              </FieldLabel>
              <RadioGroup
                id="step-variant-radio"
                className="flex px-2"
                value={stepVariant as string}
                onValueChange={(value) => setStepVariant(value as StepVariant)}
              >
                {stepVariantData.map((variant) => (
                  <div key={variant} className="flex items-center space-x-2">
                    <RadioGroupItem value={variant} />
                    <h6>{variant}</h6>
                  </div>
                ))}
              </RadioGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="label-position-radio">
                {t("stepper.labelPosition")}
              </FieldLabel>
              <RadioGroup
                id="label-position-radio"
                className="flex px-2"
                value={labelPosition as string}
                onValueChange={(value) =>
                  setLabelPosition(value as LabelPosition)
                }
              >
                {labelPositionData.map((variant) => (
                  <div key={variant} className="flex items-center space-x-2">
                    <RadioGroupItem value={variant} />
                    <h6>{variant}</h6>
                  </div>
                ))}
              </RadioGroup>
            </Field>
          </FieldGroup>
          <FieldGroup className="flex flex-row">
            <Field>
              <FieldLabel htmlFor="step-color-radio">
                {t("stepper.stepColor")}
              </FieldLabel>
              <RadioGroup
                id="step-color-radio"
                className="flex px-2"
                value={stepColor as string}
                onValueChange={(value) => setStepColor(value as StepColor)}
              >
                {stepColorData.map((variant) => (
                  <div key={variant} className="flex items-center space-x-2">
                    <RadioGroupItem value={variant} />
                    <h6>{variant}</h6>
                  </div>
                ))}
              </RadioGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="order-label-switch">
                {t("stepper.showOrderLabel")}
              </FieldLabel>
              <div>
                <Switch
                  id="order-label-switch"
                  checked={showStepOrderLabel}
                  onCheckedChange={setShowStepOrderLabel}
                />
              </div>
            </Field>
            <Field>
              <FieldLabel htmlFor="start-index-input">
                {t("stepper.startIndex")}
              </FieldLabel>
              <Input
                id="start-index-input"
                className="w-20"
                value={startIndex}
                onChange={(e) => setStartIndex(parseInt(e.target.value))}
                type={"number"}
              />
            </Field>
          </FieldGroup>
        </FieldSet>
      </FieldGroup>
      <h4 className="p-2 pt-10">{t("stepper.stepper")}</h4>
      <Stepper
        className={cn("py-3 px-6 rounded-md border mb-4")}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        orientation={orientation}
        stepVariant={stepVariant}
        labelPosition={labelPosition}
        color={stepColor}
      >
        {demoSteps.map((step, idx) => (
          <Stepper.Item key={idx} index={idx} total={demoSteps.length}>
            <Stepper.Trigger index={idx + startIndex - 1}>
              <Stepper.Label>{step.label}</Stepper.Label>
            </Stepper.Trigger>
          </Stepper.Item>
        ))}
      </Stepper>
    </div>
  );
}
