"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Stepper } from "@/components/custom/Stepper";
import { NS } from "@/lib/application/i18n";
import { cn } from "@/shared/utils/presentation";

type CreateTicketDialogStepFlowProps = {
  currentStep: number;
  onStepChange: (step: number) => void;
  createSteps: { label: string }[];
  afterSteps: { label: string }[];
};

export const CreateTicketDialogStepFlow = ({
  currentStep,
  onStepChange,
  createSteps,
  afterSteps,
}: CreateTicketDialogStepFlowProps) => {
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
      className="hidden min-w-0 shrink-0 gap-2 md:grid"
      style={{
        gridTemplateColumns: `repeat(${stepGridLayout.totalStepCount}, minmax(0, 1fr))`,
      }}
    >
      <div
        className="min-w-0"
        style={{
          gridColumn: `span ${stepGridLayout.createStepCount} / span ${stepGridLayout.createStepCount}`,
        }}
      >
        <h3 className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("message.ticketCreation")}
        </h3>
        <Stepper
          className={cn("mb-4 rounded-md border px-4 pb-8 pt-3 lg:px-8")}
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
                <Stepper.Label className="max-w-[84px] truncate text-center">
                  {step.label}
                </Stepper.Label>
              </Stepper.Trigger>
            </Stepper.Item>
          ))}
        </Stepper>
      </div>

      <div
        className="min-w-0"
        style={{
          gridColumn: `span ${stepGridLayout.afterStepCount} / span ${stepGridLayout.afterStepCount}`,
        }}
      >
        <h3 className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("message.processingFlow")}
        </h3>
        <Stepper
          className={cn(
            "mb-4 rounded-md border border-l-0 border-dotted pb-8 pl-1 pr-4 pt-3 lg:pr-8",
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
                <Stepper.Label className="max-w-[84px] truncate text-center">
                  {step.label}
                </Stepper.Label>
              </Stepper.Trigger>
            </Stepper.Item>
          ))}
        </Stepper>
      </div>
    </div>
  );
};
