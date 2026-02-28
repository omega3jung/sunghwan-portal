import { ReactNode } from "react";

import {
  LabelPosition,
  Orientation,
  StepColor,
  StepVariant,
} from "./StepperContext";

export type StepperProps = {
  currentStep: number;
  onStepChange: (step: number) => void;
  orientation?: Orientation;
  stepVariant?: StepVariant;
  labelPosition?: LabelPosition;
  color?: StepColor;
  className?: string;
  children: ReactNode;
};

export type StepperItemProps = {
  index: number;
  children: React.ReactNode;
};

export type Step = {
  label: string | JSX.Element;
  disabled?: boolean;
};
