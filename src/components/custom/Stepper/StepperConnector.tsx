"use client";

import { cn } from "@/utils";

import { useStepperContext } from "./StepperContext";
import { connectorVariant } from "./variants";

type Props = {
  index: number;
  total: number;
};

export const StepperConnector = ({ index, total }: Props) => {
  const { currentStep, orientation, color } = useStepperContext();

  if (index === total - 1) return null;

  const isCompleted = index < currentStep;

  return (
    <div
      className={cn(connectorVariant({ orientation, isCompleted, color }))}
    />
  );
};
