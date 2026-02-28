"use client";

import { createContext, useContext } from "react";

export type Orientation = "horizontal" | "vertical";
export type StepVariant = "square" | "circle";
export type StepColor = "primary" | "secondary";
export type LabelPosition = "top" | "bottom" | "right" | "left";

type StepperContextValue = {
  currentStep: number;
  onStepChange: (step: number) => void;
  orientation: Orientation;
  stepVariant: StepVariant;
  labelPosition: LabelPosition;
  color: StepColor;
};

export const StepperContext = createContext<StepperContextValue | null>(null);

export const useStepperContext = () => {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error("Stepper components must be used within Stepper");
  }
  return context;
};
