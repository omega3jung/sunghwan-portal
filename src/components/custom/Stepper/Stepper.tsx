"use client";

import React from "react";

import { cn } from "@/shared/utils/presentation";

import { StepperContext } from "./StepperContext";
import { StepperProps } from "./types";
import { stepperContainer } from "./variants";

const Root = ({
  currentStep,
  onStepChange,
  defaultStep,
  orientation = "horizontal",
  stepVariant = "square",
  labelPosition = "left",
  color = "primary",
  connectorStyle = "solid",
  leadingConnector = false,
  disabled = false,
  className,
  children,
}: StepperProps) => {
  const [uncontrolledStep, setUncontrolledStep] = React.useState(
    defaultStep ?? 0,
  );

  const resolvedCurrentStep = currentStep ?? uncontrolledStep;
  const resolvedOnStepChange = onStepChange ?? setUncontrolledStep;

  return (
    <StepperContext.Provider
      value={{
        currentStep: resolvedCurrentStep,
        onStepChange: resolvedOnStepChange,
        orientation,
        stepVariant,
        labelPosition,
        color,
        connectorStyle,
        leadingConnector,
        disabled,
      }}
    >
      <div
        className={cn(
          stepperContainer({
            orientation,
            variant: stepVariant,
            label: labelPosition,
          }),
          className,
        )}
      >
        {children}
      </div>
    </StepperContext.Provider>
  );
};

export const Stepper = Object.assign(Root, {});
