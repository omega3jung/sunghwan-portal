"use client";

import { useState } from "react";

import { Stepper } from "@/components/custom/Stepper";
import { Input } from "@/components/ui/input";

import { data } from "./mock";

export default function AvatarMultiComboBoxPage() {
  const [maxCount, setMaxCount] = useState<number>(2);

  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex">
        <h4 className="p-2">Max Count</h4>
        <Input
          className="w-20"
          value={maxCount}
          onChange={(e) => setMaxCount(parseInt(e.target.value))}
          type={"number"}
          min={1}
        />
      </div>
      <div>
        <h4 className="p-2">Stepper</h4>

        <Stepper
          currentStep={currentStep}
          steps={data}
          setStep={setCurrentStep}
        />
        <Stepper
          currentStep={currentStep}
          steps={data}
          setStep={setCurrentStep}
          variant="circle"
          orientation={"vertical"}
          labelPosition={"bottom"}
        />
      </div>
    </div>
  );
}
