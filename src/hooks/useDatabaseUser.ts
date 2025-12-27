import { useQuery } from "@tanstack/react-query";
import fetcher from "@/services/fetcher";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import { AppUser } from "@/types";

export const useDatabaseUser = () => {
  const { data: session } = useCurrentSession();

  return useQuery({
    queryKey: ["DATABASE_USER", session?.user?.id],
    queryFn: async () => {
      const res = await fetcher.api<AppUser>(`/users/${session!.user?.id}`);
      return res.data;
    },
    enabled: !!session?.user?.id,
  });
};
