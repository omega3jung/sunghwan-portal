"use client";

import { ReactNode } from "react";

import { StepperConnector } from "./StepperConnector";
import { useStepperContext } from "./StepperContext";

type Props = {
  index: number;
  total: number;
  children: ReactNode;
};

export const StepperItem = ({ index, total, children }: Props) => {
  const { orientation } = useStepperContext();

  // vertical.
  if (orientation === "vertical") {
    return (
      <div className="flex flex-col items-center">
        {children}

        <StepperConnector index={index} total={total} />
      </div>
    );
  }

  // horizontal.
  return (
    <>
      <div className="flex items-center">{children}</div>
      <StepperConnector index={index} total={total} />
    </>
  );
};
