import { useMutation, useQueryClient } from "@tanstack/react-query";

import { SERVICE_DESK_KEY } from "../keys";

export async function resetServiceDeskDemo() {
  const response = await fetch("/api/demo/service-desk/reset", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to reset demo data.");
  }

  return response.json() as Promise<{ success: boolean }>;
}

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
