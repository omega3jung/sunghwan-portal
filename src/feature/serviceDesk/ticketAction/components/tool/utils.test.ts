import type { UseFormReturn } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import type { TicketActionDraftFormValues } from "../../forms";
import { setActionFieldValue } from "./utils";

function createForm({
  isSubmitted = false,
  hasError = false,
}: {
  isSubmitted?: boolean;
  hasError?: boolean;
} = {}) {
  const setValue = vi.fn();
  const form = {
    formState: { isSubmitted },
    getFieldState: vi.fn(() => ({
      error: hasError ? { type: "validate", message: "invalid" } : undefined,
    })),
    setValue,
  } as unknown as UseFormReturn<TicketActionDraftFormValues>;

  return { form, setValue };
}

describe("setActionFieldValue", () => {
  it.each([
    ["a pristine field before submit", false, false, false],
    ["a field after submit", true, false, true],
    ["a field with an existing error", false, true, true],
  ] as const)(
    "marks %s dirty and resolves validation to %s",
    (_, isSubmitted, hasError, shouldValidate) => {
      const { form, setValue } = createForm({ isSubmitted, hasError });

      setActionFieldValue(form, "content", "Updated content");

      expect(setValue).toHaveBeenCalledWith("content", "Updated content", {
        shouldDirty: true,
        shouldValidate,
      });
    },
  );
});
