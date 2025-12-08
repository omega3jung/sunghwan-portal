export type Step = {
  label: string | JSX.Element;
  disabled?: boolean;
};

export type StepperProps = {
  currentStep: number;
  steps: Step[];
  setStep: (step: number) => void;
  startNumber?: 0 | 1;
  orientation?: "horizontal" | "vertical";
  labelPosition?: "top" | "bottom";
  variant?: "circle" | "square";
  assetColor?: string;
};
