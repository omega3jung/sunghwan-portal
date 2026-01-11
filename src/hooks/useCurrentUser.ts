// hooks/useCurrentUser.ts
import { useQuery } from "@tanstack/react-query";

export function useCurrentUser(userId: string) {
  return useQuery({
    queryKey: ["current-user", userId],
    queryFn: async (userId) => {
      const res = await fetch("/api/user-profile/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userId),
      });
      if (!res.ok) return null;
      return res.json();
    },
  });
}
