import { TreeNodes } from "@/components/custom/dnd/tree/types";
import { Stepper } from "@/components/custom/Stepper";
import { SupportedLanguage } from "@/domain/config";

import { useApprovalStepper } from "../hooks/useApprovalStepper";
import { ApprovalStepData, CategoryApprovalStepData } from "../types";

type Props = {
  selectedNode: CategoryApprovalStepData | ApprovalStepData | null;
  tree: TreeNodes<CategoryApprovalStepData | ApprovalStepData>;
  language: SupportedLanguage;
};
export const ApprovalStepperPanel = ({
  selectedNode,
  tree,
  language,
}: Props) => {
  const { steps, currentStep, setCurrentStep } = useApprovalStepper({
    selectedNode,
    tree,
    language,
  });

  // displat empty box.
  if (!selectedNode || selectedNode.nodeType !== "approvalStep") {
    return (
      <div className="h-full rounded-lg border border-dashed p-7 text-sm text-muted-foreground"></div>
    );
  }

  return (
    <div className="pt-2 px-2">
      <Stepper
        className="h-full py-2 px-4 rounded-md border"
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        orientation="vertical"
        stepVariant="circle"
        labelPosition="right"
      >
        {steps.map((step, idx) => (
          <Stepper.Item key={idx} index={idx} total={steps.length}>
            <Stepper.Trigger index={idx - 1}>
              <Stepper.Label>{step.label}</Stepper.Label>
            </Stepper.Trigger>
          </Stepper.Item>
        ))}
      </Stepper>
    </div>
  );
};
