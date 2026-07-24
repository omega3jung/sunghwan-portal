import type { ReactElement, ReactNode } from "react";

import {
  ConnectorStyle,
  LabelPosition,
  Orientation,
  StepColor,
  StepVariant,
} from "./StepperContext";

type StepperBaseProps = {
  orientation?: Orientation;
  stepVariant?: StepVariant;
  labelPosition?: LabelPosition;
  color?: StepColor;
  connectorStyle?: ConnectorStyle;
  leadingConnector?: boolean;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
};

type ControlledStepperProps = {
  currentStep: number;
  onStepChange: (step: number) => void;
  defaultStep?: never;
};

type UncontrolledStepperProps = {
  currentStep?: never;
  onStepChange?: never;
  defaultStep?: number;
};

export type StepperProps = StepperBaseProps &
  (ControlledStepperProps | UncontrolledStepperProps);

export type StepperItemProps = {
  index: number;
  total: number;
  children: ReactNode;
};

export type Step = {
  label: string | ReactElement;
  disabled?: boolean;
};
