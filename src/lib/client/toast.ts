"use client";

import { useTranslation } from "react-i18next";

import { NS } from "@/lib/application/i18n";
import { toast } from "@/shared/client/toast";
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
    toast.add({
      title: tMessage("common.save.title"),
      description: tMessage("common.save.success", { item }),
      type: "info",
    });

  const deleted = (item: string) =>
    toast.add({
      title: tMessage("common.delete.title"),
      description: tMessage("common.delete.success", { item }),
      type: "info",
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
  return toast.promise(promise, {
    loading: {
      title: messages.loading,
      type: "loading",
    },
    success: (data) => ({
      title:
        typeof messages.success === "function"
          ? messages.success(data)
          : messages.success,
      type: "success",
    }),
    error: (error) => ({
      title:
        typeof messages.error === "function"
          ? messages.error(error)
          : messages.error,
      type: "error",
    }),
  });
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
      loading: {
        title: tMessage(`common.${type}.loading`, { item }),
        type: "loading",
      },

      success: {
        title: tMessage(`common.${type}.title`),
        description: tMessage(`common.${type}.success`, { item }),
        type: "success",
      },

      error: {
        title: tError(`common.${type}.title`),
        description: tError(`common.${type}.message`, { item }),
        type: "error",
      },
    });
  };
};
