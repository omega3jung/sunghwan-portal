"use client";

import { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/shared/utils";

import { useStepperContext } from "./StepperContext";
import { triggerIndexVariant, triggerVariant } from "./variants";

type Props = {
  index: number;
  disabled?: boolean;
  className?: string;
  children?: ReactNode; // label
};

export const StepperTrigger = ({
  index,
  disabled = false,
  className,
  children,
}: Props) => {
  const {
    currentStep,
    onStepChange,
    stepVariant,
    color,
    disabled: isStepperDisabled,
  } = useStepperContext();

  const isDisabled = isStepperDisabled || disabled;

  const state =
    index < currentStep
      ? "completed"
      : index === currentStep
        ? "active"
        : "future";

  return (
    <Button
      type="button"
      disabled={isDisabled}
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
