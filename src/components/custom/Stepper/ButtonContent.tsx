import { Check, Minus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Step } from "./types";

export const ButtonContent = ({
  variant,
  item,
  index,
  currentStep,
  startNumber,
}: {
  variant: string;
  item: Step;
  index: number;
  currentStep: number;
  startNumber: number;
}) => {
  const { t } = useTranslation("Stepper");

  if (item.disabled) {
    return <Minus />;
  }

  if (variant === "circle") {
    if (index >= currentStep) {
      return index + startNumber;
    }

    return (
      <Check>
        <title>check</title>
      </Check>
    );
  }

  if (variant === "square") {
    const number = index + (startNumber === 0 ? 1 : 0);
    const label = item.label as string;

    return t("step") + " " + number + " - " + label;
  }

  return null;
};
