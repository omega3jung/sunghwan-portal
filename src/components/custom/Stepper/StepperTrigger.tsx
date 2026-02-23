"use client";

import { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

import { useStepperContext } from "./StepperContext";
import { triggerIndexVariant, triggerVariant } from "./variants";

type Props = {
  index: number;
  className?: string;
  children?: ReactNode; // label
};

export const StepperTrigger = ({ index, className, children }: Props) => {
  const { currentStep, onStepChange, stepVariant, color } = useStepperContext();

  const state =
    index < currentStep
      ? "completed"
      : index === currentStep
        ? "active"
        : "future";

  return (
    <Button
      onClick={() => onStepChange(index)}
      className={cn(
        triggerVariant({ variant: stepVariant, state, color }),
        "group",
        className,
      )}
    >
      {stepVariant === "circle" && (
        <span
          className={cn(
            triggerIndexVariant({ variant: stepVariant, state, color }),
          )}
        >
          {index + 1}
        </span>
      )}
      {children}
    </Button>
  );
};
