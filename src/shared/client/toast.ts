"use client";

import { Toast } from "@base-ui/react/toast";

/** Client-only toast manager shared by imperative notification callers. */
export const toast = Toast.createToastManager();
