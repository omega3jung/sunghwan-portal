"use client";

import React from "react";

import { cn } from "@/shared/utils";

import { StepperContext } from "./StepperContext";
import { StepperProps } from "./types";
import { stepperContainer } from "./variants";

const Root = ({
  currentStep,
  onStepChange,
  orientation = "horizontal",
  stepVariant = "square",
  labelPosition = "left",
  color = "primary",
  className,
  children,
}: StepperProps) => {
  return (
    <StepperContext.Provider
      value={{
        currentStep,
        onStepChange,
        orientation,
        stepVariant,
        labelPosition,
        color,
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
