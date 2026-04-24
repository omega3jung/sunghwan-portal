import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Stepper } from "@/components/custom/Stepper";
import { NS } from "@/lib/i18n";
import { cn } from "@/shared/utils";

type TicketFormDialogStepFlowProps = {
  currentStep: number;
  onStepChange: (step: number) => void;
  createSteps: { label: string }[];
  afterSteps: { label: string }[];
};

export const TicketFormDialogStepFlow = ({
  currentStep,
  onStepChange,
  createSteps,
  afterSteps,
}: TicketFormDialogStepFlowProps) => {
  const { t } = useTranslation(NS.serviceDesk);

  const stepGridLayout = useMemo(() => {
    const createStepCount = Math.max(createSteps.length, 1);
    const afterStepCount = Math.max(afterSteps.length, 1);
    const totalStepCount = createStepCount + afterStepCount;

    return {
      totalStepCount,
      createStepCount,
      afterStepCount,
    };
  }, [afterSteps.length, createSteps.length]);

  return (
    <div
      className="grid shrink-0"
      style={{
        gridTemplateColumns: `repeat(${stepGridLayout.totalStepCount}, minmax(0, 1fr))`,
      }}
    >
      <span
        style={{
          gridColumn: `span ${stepGridLayout.createStepCount} / span ${stepGridLayout.createStepCount}`,
        }}
      >
        <h3 className="text-center text-xs font-semibold text-muted-foreground tracking-wide uppercase">
          {t("message.ticketCreation")}
        </h3>
        <Stepper
          className={cn("pt-3 pb-8 px-8 rounded-md border mb-4")}
          currentStep={currentStep}
          onStepChange={onStepChange}
          orientation="horizontal"
          stepVariant="circle"
          labelPosition="bottom"
          color="primary"
        >
          {createSteps.map((step, idx) => (
            <Stepper.Item key={idx} index={idx} total={createSteps.length}>
              <Stepper.Trigger index={idx}>
                <Stepper.Label>{step.label}</Stepper.Label>
              </Stepper.Trigger>
            </Stepper.Item>
          ))}
        </Stepper>
      </span>

      <span
        style={{
          gridColumn: `span ${stepGridLayout.afterStepCount} / span ${stepGridLayout.afterStepCount}`,
        }}
      >
        <h3 className="text-center text-xs font-semibold text-muted-foreground tracking-wide uppercase">
          {t("message.processingFlow")}
        </h3>
        <Stepper
          className={cn(
            "pt-3 pb-8 pl-1 pr-8 rounded-md border border-l-0 border-dotted mb-4",
          )}
          orientation="horizontal"
          stepVariant="circle"
          labelPosition="bottom"
          color="primary"
          connectorStyle="dotted"
          leadingConnector={true}
          disabled={true}
        >
          {afterSteps.map((step, idx) => (
            <Stepper.Item key={idx} index={idx} total={afterSteps.length}>
              <Stepper.Trigger index={idx + 3}>
                <Stepper.Label>{step.label}</Stepper.Label>
              </Stepper.Trigger>
            </Stepper.Item>
          ))}
        </Stepper>
      </span>
    </div>
  );
};
