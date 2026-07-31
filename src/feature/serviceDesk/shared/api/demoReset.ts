"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { SERVICE_DESK_KEY } from "../keys";

/** Resets mutable LOCAL Service Desk state through the demo-only API endpoint. */
export async function resetServiceDeskDemo() {
  const response = await fetch("/api/demo/service-desk/reset", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to reset demo data.");
  }

  return response.json() as Promise<{ success: boolean }>;
}

/** Exposes LOCAL demo reset as a mutation and clears Service Desk caches after success. */
export const useResetServiceDeskDemo = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: resetServiceDeskDemo,
    onSuccess: async () => {
      await queryClient.resetQueries({
        queryKey: [SERVICE_DESK_KEY],
        exact: false,
      });
    },
  });
};
