import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Stepper } from "@/components/custom/Stepper";

const steps = ["Request", "Triage", "Work", "Resolution"];

const meta = {
  title: "Custom/Stepper",
  component: Stepper,
  args: {
    children: null,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Compound step navigation with controlled/uncontrolled state and horizontal or vertical layouts.",
      },
    },
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

function StepperItems() {
  return steps.map((label, index) => (
    <Stepper.Item index={index} key={label} total={steps.length}>
      <Stepper.Trigger index={index}>
        <Stepper.Label>{label}</Stepper.Label>
      </Stepper.Trigger>
    </Stepper.Item>
  ));
}

function ControlledStepper() {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="max-w-3xl px-10 py-8">
      <Stepper
        currentStep={currentStep}
        labelPosition="bottom"
        onStepChange={setCurrentStep}
        stepVariant="circle"
      >
        <StepperItems />
      </Stepper>
    </div>
  );
}

export const Default: Story = {
  render: () => <ControlledStepper />,
};

export const Vertical: Story = {
  render: () => (
    <div className="h-96 w-72 px-20 py-4">
      <Stepper
        defaultStep={2}
        labelPosition="right"
        orientation="vertical"
        stepVariant="circle"
      >
        <StepperItems />
      </Stepper>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="max-w-3xl py-4">
      <Stepper defaultStep={1} disabled>
        <StepperItems />
      </Stepper>
    </div>
  ),
};
