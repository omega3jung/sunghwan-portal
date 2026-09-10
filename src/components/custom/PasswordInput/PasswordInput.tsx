"use client";

import { Eye, EyeOff } from "lucide-react";
import { type ComponentProps, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { NS } from "@/lib/application/i18n";

export type PasswordInputProps = Omit<
  ComponentProps<typeof InputGroupInput>,
  "type"
> & {
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
};

/** Password field with an accessible, locally managed visibility toggle. */
export function PasswordInput({
  className,
  disabled,
  showPasswordLabel,
  hidePasswordLabel,
  ...props
}: PasswordInputProps) {
  const { t } = useTranslation(NS.component, { keyPrefix: "passwordInput" });
  const [isVisible, setIsVisible] = useState(false);
  const toggleLabel = isVisible
    ? (hidePasswordLabel ?? t("hidePassword"))
    : (showPasswordLabel ?? t("showPassword"));

  return (
    <InputGroup className={className}>
      <InputGroupInput
        {...props}
        type={isVisible ? "text" : "password"}
        disabled={disabled}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          type="button"
          size="icon-xs"
          disabled={disabled}
          aria-label={toggleLabel}
          onClick={() => setIsVisible((current) => !current)}
        >
          {isVisible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
