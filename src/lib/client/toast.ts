"use client";

import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { NS } from "@/lib/application/i18n";
import { MutationAction } from "@/shared/types";

/**
 * Creates localized helpers for common saved and deleted toast notifications.
 *
 * Use for:
 * - Showing consistent success feedback after create or delete actions
 * - Reusing translated toast messaging across feature modules
 *
 * @param none - This hook does not accept any arguments
 * @returns An object containing `saved` and `deleted` helper functions that accept an item label
 */
export const useToastMessage = () => {
  const { t: tMessage } = useTranslation(NS.message);

  const saved = (item: string) =>
    toast.info(tMessage("saved.title"), {
      description: tMessage("saved.success", { item }),
    });

  const deleted = (item: string) =>
    toast.info(tMessage("deleted.title"), {
      description: tMessage("deleted.success", { item }),
    });

  return {
    saved,
    deleted,
  };
};

/**
 * Wraps a promise with loading, success, and error toast states.
 *
 * Use for:
 * - Displaying async mutation progress with a single helper call
 * - Reusing custom toast copy for non-standard promise flows
 *
 * @param promise - The promise whose lifecycle should drive the toast states
 * @param messages - The loading, success, and error messages or message builders for the toast
 * @returns The same promise wrapped by `toast.promise`
 */
export const mutationToast = <T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  },
) => {
  return toast.promise(promise, messages);
};

/**
 * Creates a localized toast helper for common mutation actions such as create, update, or delete.
 *
 * Use for:
 * - Showing standardized mutation feedback with translated copy
 * - Avoiding repeated toast configuration in API mutation handlers
 *
 * @param none - This hook does not accept any arguments
 * @returns A function that accepts a mutation promise, action type, and item label and shows localized toast states
 */
export const useMutationToast = () => {
  const { t: tMessage } = useTranslation(NS.message);
  const { t: tError } = useTranslation(NS.error);

  return <T>(promise: Promise<T>, type: MutationAction, item: string) => {
    return toast.promise(promise, {
      loading: tMessage(`common.${type}.loading`, { item }),

      success: {
        message: tMessage(`common.${type}.title`),
        description: tMessage(`common.${type}.success`, { item }),
        closeButton: true,
        position: "top-right",
      },

      error: {
        message: tError(`common.${type}.title`),
        description: tError(`common.${type}.message`, { item }),
        closeButton: true,
      },
    });
  };
};
