"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";

type Props = {
  children: React.ReactNode;
};

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 60 * 1 sec = 1 min.
        retry: 1,
      },
    },
  });
}

export function RootProviders({ children }: Props) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={5 * 60}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SessionProvider>
  );
}
