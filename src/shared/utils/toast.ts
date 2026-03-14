import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { NS } from "@/lib/i18n";

import { MutationAction } from "../types";

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

export const useMutationToast = () => {
  const { t: tMessage } = useTranslation(NS.message);
  const { t: tError } = useTranslation(NS.error);

  return <T>(promise: Promise<T>, type: MutationAction, item: string) => {
    return toast.promise(promise, {
      loading: tMessage(`common.${type}.loading`, { item }),

      success: {
        message: tMessage(`common.${type}.title`),
        description: tMessage(`common.${type}.success`, { item }),
        position: "top-right",
      },

      error: {
        message: tError(`common.${type}.title`),
        description: tError(`common.${type}.message`, { item }),
      },
    });
  };
};
