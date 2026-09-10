import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useTranslation } from "react-i18next";
import { useArgs } from "storybook/preview-api";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { Stepper } from "@/components/custom/Stepper";
import { NS } from "@/lib/application/i18n";

const stepKeys = ["receiving", "triage", "estimate", "quote"] as const;

const meta = {
  title: "Custom/Stepper",
  component: Stepper,
  args: {
    children: null,
    color: "primary",
    connectorStyle: "solid",
    currentStep: 1,
    disabled: false,
    labelPosition: "bottom",
    leadingConnector: false,
    onStepChange: fn(),
    orientation: "horizontal",
    stepVariant: "circle",
  },
  argTypes: {
    children: { control: false },
    color: { control: "radio", options: ["primary", "secondary"] },
    connectorStyle: {
      control: "radio",
      options: ["solid", "dashed", "dotted"],
    },
    defaultStep: { table: { disable: true } },
    labelPosition: {
      control: "select",
      options: ["top", "bottom", "right", "left"],
    },
    orientation: { control: "radio", options: ["horizontal", "vertical"] },
    stepVariant: { control: "radio", options: ["square", "circle"] },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Controlled compound step navigation. Layout, marker, color, connector, and current-step props are connected to Storybook args.",
      },
    },
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

function StepperItems({
  numberedLabels = false,
  startIndex = 0,
}: {
  numberedLabels?: boolean;
  startIndex?: number;
}) {
  const { t } = useTranslation(NS.storybook, { keyPrefix: "stepper" });

  return stepKeys.map((stepKey, index) => {
    const label = t(`steps.${stepKey}`);

    return (
      <Stepper.Item index={index} key={stepKey} total={stepKeys.length}>
        <Stepper.Trigger index={index + startIndex}>
          <Stepper.Label>
            {numberedLabels
              ? t("stepLabel", { label, order: index + 1 })
              : label}
          </Stepper.Label>
        </Stepper.Trigger>
      </Stepper.Item>
    );
  });
}

function CurrentStepOutput({ currentStep }: { currentStep?: number }) {
  const { t } = useTranslation(NS.storybook, { keyPrefix: "stepper" });

  return (
    <output
      className="block rounded-md bg-muted px-3 py-2 font-mono text-xs"
      data-testid="current-step"
    >
      {t("title")}: {currentStep}
    </output>
  );
}

export const Default: Story = {
  render: function Render(args) {
    const [, updateArgs] = useArgs<typeof args>();

    return (
      <div className="max-w-3xl space-y-4 px-10 py-8">
        <Stepper
          className={args.className}
          color={args.color}
          connectorStyle={args.connectorStyle}
          currentStep={args.currentStep ?? 0}
          disabled={args.disabled}
          labelPosition={args.labelPosition}
          leadingConnector={args.leadingConnector}
          orientation={args.orientation}
          stepVariant={args.stepVariant}
          onStepChange={(currentStep: number) => {
            updateArgs({ currentStep });
            args.onStepChange?.(currentStep);
          }}
        >
          <StepperItems />
        </Stepper>
        <CurrentStepOutput currentStep={args.currentStep} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getAllByRole("button")[2]);
    await waitFor(() => {
      expect(canvas.getByTestId("current-step")).toHaveTextContent("2");
    });
  },
};

export const Vertical: Story = {
  args: { currentStep: 2, labelPosition: "right", orientation: "vertical" },
  render: Default.render,
};

export const Square: Story = {
  args: { labelPosition: "left", stepVariant: "square" },
  render: Default.render,
};

export const NumberedLabels: Story = {
  args: { labelPosition: "left", stepVariant: "square" },
  parameters: {
    docs: {
      description: {
        story:
          "Step numbering is consumer-owned label content. This composition keeps localized prefixes outside the Stepper public API.",
      },
    },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs<typeof args>();

    return (
      <div className="max-w-3xl space-y-4 px-10 py-8">
        <Stepper
          className={args.className}
          color={args.color}
          connectorStyle={args.connectorStyle}
          currentStep={args.currentStep ?? 0}
          disabled={args.disabled}
          labelPosition={args.labelPosition}
          leadingConnector={args.leadingConnector}
          orientation={args.orientation}
          stepVariant={args.stepVariant}
          onStepChange={(currentStep: number) => {
            updateArgs({ currentStep });
            args.onStepChange?.(currentStep);
          }}
        >
          <StepperItems numberedLabels />
        </Stepper>
        <CurrentStepOutput currentStep={args.currentStep} />
      </div>
    );
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  render: Default.render,
};

export const OffsetTriggerIndexes: Story = {
  args: { currentStep: 3 },
  render: function Render(args) {
    const [, updateArgs] = useArgs<typeof args>();

    return (
      <div className="max-w-3xl space-y-4 px-10 py-8">
        <Stepper
          className={args.className}
          color={args.color}
          connectorStyle={args.connectorStyle}
          currentStep={args.currentStep ?? 0}
          disabled={args.disabled}
          labelPosition={args.labelPosition}
          leadingConnector={args.leadingConnector}
          orientation={args.orientation}
          stepVariant={args.stepVariant}
          onStepChange={(currentStep: number) => {
            updateArgs({ currentStep });
            args.onStepChange?.(currentStep);
          }}
        >
          <StepperItems startIndex={3} />
        </Stepper>
        <CurrentStepOutput currentStep={args.currentStep} />
      </div>
    );
  },
};
