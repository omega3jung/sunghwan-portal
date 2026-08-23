"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Stepper } from "@/components/custom/Stepper";
import {
  ConnectorStyle,
  LabelPosition,
  Orientation,
  StepColor,
  StepVariant,
} from "@/components/custom/Stepper/StepperContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { NS } from "@/lib/application/i18n";
import {
  connectorStyleData,
  labelPositionData,
  orientationData,
  stepColorData,
  stepperMock,
  stepVariantData,
} from "@/mocks/ui/demo/stepper";
import { cn } from "@/shared/utils/presentation";

export function StepperPage() {
  const { t } = useTranslation(NS.demo, { keyPrefix: "stepper" });

  const [currentStep, setCurrentStep] = useState(1);
  const [orientation, setOrientation] = useState<Orientation>("horizontal");
  const [stepVariant, setStepVariant] = useState<StepVariant>("square");
  const [labelPosition, setLabelPosition] = useState<LabelPosition>("left");
  const [stepColor, setStepColor] = useState<StepColor>("primary");
  const [connectorStyle, setConnectorStyle] = useState<ConnectorStyle>("solid");

  const [showStepOrderLabel, setShowStepOrderLabel] = useState<boolean>(true);
  const [disableSteps, setDisableSteps] = useState<boolean>(false);
  const [leadingConnector, setLeadingConnector] = useState<boolean>(false);
  const [startIndex, setStartIndex] = useState<number>(1);

  const demoSteps = useMemo<{ label: string }[]>(() => {
    return stepperMock.map((step, idx) => {
      const label = t(`steps.${step.label.toLowerCase()}`);

      if (showStepOrderLabel) {
        return {
          label: t("stepLabel", {
            order: idx + startIndex,
            label,
          }),
        };
      }
      return { label };
    });
  }, [showStepOrderLabel, startIndex, t]);

  return (
    <div className="flex flex-col p-4">
      <FieldGroup>
        <FieldSet>
          <FieldGroup className="grid grid-cols-4 gap-x-8 gap-y-16">
            <Field>
              <FieldLabel htmlFor="orientation-radio">
                {t("orientation")}
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
                    <h6>{t(`options.${variant}`)}</h6>
                  </div>
                ))}
              </RadioGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="step-variant-radio">
                {t("stepVariant")}
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
                    <h6>{t(`options.${variant}`)}</h6>
                  </div>
                ))}
              </RadioGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="step-color-radio">
                {t("stepColor")}
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
                    <h6>{t(`options.${variant}`)}</h6>
                  </div>
                ))}
              </RadioGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="label-position-radio">
                {t("labelPosition")}
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
                    <h6>{t(`options.${variant}`)}</h6>
                  </div>
                ))}
              </RadioGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="connector-style-radio">
                {t("connectorStyle")}
              </FieldLabel>
              <div className="grid grid-cols-2">
                <RadioGroup
                  id="connector-style-radio"
                  className="flex"
                  value={connectorStyle}
                  onValueChange={(value) =>
                    setConnectorStyle(value as ConnectorStyle)
                  }
                >
                  {connectorStyleData.map((variant) => (
                    <div key={variant} className="flex items-center space-x-2">
                      <RadioGroupItem value={variant} />
                      <h6 className="text-nowrap">{t(`options.${variant}`)}</h6>
                    </div>
                  ))}
                </RadioGroup>
                <span className="col-span-2 flex items-center gap-2 pt-2">
                  <Checkbox
                    checked={leadingConnector}
                    onCheckedChange={setLeadingConnector}
                  />
                  {t("leadingConnector")}
                </span>
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="order-label-switch">
                {t("showOrderLabel")}
              </FieldLabel>
              <div className="grid grid-cols-2">
                <Switch
                  id="order-label-switch"
                  checked={showStepOrderLabel}
                  onCheckedChange={setShowStepOrderLabel}
                />
                <span className="flex items-center gap-2">
                  <Checkbox
                    checked={disableSteps}
                    onCheckedChange={setDisableSteps}
                  />
                  {t("disable")}
                </span>
              </div>
            </Field>
            <Field>
              <FieldLabel htmlFor="start-index-input">
                {t("startIndex")}
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
      <h4 className="p-2 pt-10">{t("title")}</h4>
      <Stepper
        className={cn("py-3 px-6 rounded-md border")}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        orientation={orientation}
        stepVariant={stepVariant}
        labelPosition={labelPosition}
        color={stepColor}
        connectorStyle={connectorStyle}
        leadingConnector={leadingConnector}
        disabled={disableSteps}
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
