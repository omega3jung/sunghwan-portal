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
import { useLanguageState } from "@/feature/user/preference/client";
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

export default function AvatarMultiComboBoxPage() {
  const { t } = useTranslation(NS.demo);
  const { language } = useLanguageState();

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
    <div className="flex flex-col p-4">
      <FieldGroup>
        <FieldSet>
          <FieldGroup className="grid grid-cols-4">
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
            <Field>
              <FieldLabel htmlFor="connector-style-radio">
                Connector Style
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
                      <h6>{variant}</h6>
                    </div>
                  ))}
                </RadioGroup>
                <span className="col-span-2 flex items-center gap-2 pt-2">
                  <Checkbox
                    checked={leadingConnector}
                    onCheckedChange={(value) =>
                      setLeadingConnector(value === "indeterminate" || value)
                    }
                  />
                  Leading Connector
                </span>
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="order-label-switch">
                {t("stepper.showOrderLabel")}
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
                    onCheckedChange={(value) =>
                      setDisableSteps(value === "indeterminate" || value)
                    }
                  />
                  {t("stepper.disable")}
                </span>
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
