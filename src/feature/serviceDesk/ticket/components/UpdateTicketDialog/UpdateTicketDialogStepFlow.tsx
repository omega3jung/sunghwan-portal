import { Stepper } from "@/components/custom/Stepper";

type UpdateTicketDialogStepFlowProps = {
  currentStep: number;
  steps: Array<{ key: string; label: string }>;
  onStepChange: (step: number) => void;
};

export function UpdateTicketDialogStepFlow({
  currentStep,
  steps,
  onStepChange,
}: UpdateTicketDialogStepFlowProps) {
  return (
    <Stepper
      className="mb-4 hidden rounded-md border px-4 pb-8 pt-3 md:flex lg:px-8"
      currentStep={currentStep}
      onStepChange={onStepChange}
      orientation="horizontal"
      stepVariant="circle"
      labelPosition="bottom"
      color="primary"
    >
      {steps.map((step, index) => (
        <Stepper.Item key={step.key} index={index} total={steps.length}>
          <Stepper.Trigger index={index} disabled={index > currentStep}>
            <Stepper.Label className="max-w-[96px] truncate text-center">
              {step.label}
            </Stepper.Label>
          </Stepper.Trigger>
        </Stepper.Item>
      ))}
    </Stepper>
  );
}
