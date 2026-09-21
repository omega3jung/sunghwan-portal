"use client";

import { Toast } from "@base-ui/react/toast";
import type { ComponentProps } from "react";

export type ToastData = {
  secondaryActionProps?: Pick<ComponentProps<"button">, "children" | "onClick" | "disabled">;
};

/** Client-only toast manager shared by imperative notification callers. */
export const toast = Toast.createToastManager<ToastData>();
