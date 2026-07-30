import { Workflow } from "lucide-react";
import { useTranslation } from "react-i18next";

import { TreeNodes } from "@/components/custom/dnd/tree/types";
import { Stepper } from "@/components/custom/Stepper";
import { NS, SupportedLanguage } from "@/lib/application/i18n";

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
  const { t } = useTranslation(NS.settings);

  return (
    <section className="min-w-0 h-full overflow-hidden rounded-lg border bg-background">
      <div className="flex items-center gap-2 border-b px-4 py-2">
        <Workflow className="h-4 w-4 text-primary" />
        <h2>{t("serviceDeskSettings.common.approvalStepList")}</h2>
      </div>

      <div className="min-w-0 px-4 py-4">
        {!selectedNode || selectedNode.nodeType !== "approvalStep" ? (
          <div className="rounded-lg px-2 h-full text-center text-sm text-muted-foreground">
            {t("serviceDeskSettings.approvalStepTab.empty")}
          </div>
        ) : (
          <Stepper
            className="h-full py-2"
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            orientation="vertical"
            stepVariant="circle"
            labelPosition="right"
          >
            {steps.map((step, idx) => (
              <Stepper.Item key={step.id} index={idx} total={steps.length}>
                <Stepper.Trigger index={idx - 1}>
                  <Stepper.Label>{step.label}</Stepper.Label>
                </Stepper.Trigger>
              </Stepper.Item>
            ))}
          </Stepper>
        )}
      </div>
    </section>
  );
};
