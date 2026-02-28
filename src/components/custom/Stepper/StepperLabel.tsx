"use client";

import { ReactNode } from "react";

import { cn } from "@/utils";

import { LabelPosition, useStepperContext } from "./StepperContext";

type Props = { className?: string; children: ReactNode };

export const StepperLabel = ({ className, children }: Props) => {
  const { stepVariant, labelPosition = "bottom" } = useStepperContext();

  const positionClasses: Record<LabelPosition, string> = {
    top: "absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-background",
    bottom: "absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-background",
    left: "absolute right-full mr-3 px-1 top-1/2 -translate-y-1/2 bg-background",
    right:
      "absolute left-full ml-3 px-1 top-1/2 -translate-y-1/2 bg-background",
  };

  // 🔥 square일 땐 렌더하지 않음
  if (stepVariant === "square")
    return (
      <span
        className={cn(
          "font-medium whitespace-nowrap",
          "group-hover:text-white",
          className,
        )}
      >
        {children}
      </span>
    );

  return (
    <span
      className={cn(
        "text-xs font-medium whitespace-nowrap",
        positionClasses[labelPosition],
        className,
      )}
    >
      {children}
    </span>
  );
};
