"use client";

import React from "react";

import { cn } from "@/lib/utils";

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
  const paddingMap = {
    top: "pt-6",
    bottom: "pb-6",
    left: "",
    right: "",
  };

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
          stepperContainer({ orientation }),
          orientation === "vertical" && "items-center",
          stepVariant === "circle" && paddingMap[labelPosition],
          className,
        )}
      >
        {children}
      </div>
    </StepperContext.Provider>
  );
};

export const Stepper = Object.assign(Root, {});
