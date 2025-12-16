"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { StepperProps } from "./types";
import { stepsBackgroundVariant, stepsVariant } from "./variants";
import { ButtonContent } from "./ButtonContent";
import React from "react";

const Component = (props: StepperProps) => {
  const {
    steps,
    currentStep,
    setStep,
    startNumber = 1,
    orientation = "horizontal",
    labelPosition = "top",
    variant = "square",
    assetColor = "primary",
  } = props;

  return (
    <div
      data-testid="stepper"
      data-orientation={orientation}
      className={cn(stepsBackgroundVariant({ variant }))}
    >
      {steps.map((item, index) => (
        <div
          data-orientation={orientation}
          className="relative flex flex-1 grow flex-col items-center data-[orientation=vertical]:justify-center"
          key={`stepper-step-${index}`}
        >
          {labelPosition === "top" && variant === "circle" && (
            <Label
              htmlFor={`stepper-button-${index}`}
              className={cn(
                `mb-1 text-sm font-semibold text-${assetColor} md:text-base`,
                item.disabled && "text-zinc-400",
                !item.disabled && index > currentStep
              )}
            >
              {item.label}
            </Label>
          )}
          {!!index && (
            <div
              data-variant={variant}
              data-circle-bottom={
                variant === "circle" && labelPosition === "bottom"
              }
              className={cn(
                orientation === "horizontal"
                  ? "absolute left-[calc(-50%+18px)] right-[calc(50%+18px)] h-px data-[circle-bottom=true]:top-[18px] data-[variant=circle]:bottom-[18px] data-[variant=square]:bottom-1/2"
                  : "absolute -top-1/2 left-1/2 -z-[1] h-full w-px data-[variant=circle]:-z-[1] data-[variant=square]:z-[1]",
                index > currentStep ? "bg-neutral-300" : `bg-${assetColor}`
              )}
            ></div>
          )}
          <Button
            id={`stepper-button-${index}`}
            data-testid={`stepper-button-${index}`}
            data-variant={variant}
            onClick={() => setStep(index)}
            disabled={item.disabled}
            className={cn(
              stepsVariant({
                variant,
                className: cn(
                  `text-white bg-${assetColor}`,
                  index > currentStep &&
                    "border border-neutral-400 bg-white text-zinc-700 dark:bg-foreground dark:text-basic data-[variant=square]:dark:border-none",
                  !!item.disabled && "bg-neutral-400 text-white"
                ),
              })
            )}
          >
            <ButtonContent
              variant={variant}
              item={item}
              index={index}
              currentStep={currentStep}
              startNumber={startNumber}
            />
          </Button>
          {labelPosition === "bottom" && variant === "circle" && (
            <Label
              htmlFor={`stepper-button-${index}`}
              className={cn(
                `mb-1 p-1 text-center text-xs font-semibold text-${assetColor} md:text-base`,
                item.disabled && "text-zinc-400",
                !item.disabled &&
                  index > currentStep &&
                  "text-zinc-700 dark:text-white"
              )}
            >
              {item.label}
            </Label>
          )}
        </div>
      ))}
    </div>
  );
};

export const Stepper = React.forwardRef<any, StepperProps>(Component);
