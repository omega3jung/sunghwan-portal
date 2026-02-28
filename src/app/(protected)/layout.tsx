// app/(protected)/layout.tsx

import { ReactNode } from "react";

import { ProtectedProviders } from "./_providers";
import { ProtectedShell } from "./_shell/ProtectedShell";

// force-dynamic to block cache store.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  // use client ❌ session ❌ redirect ❌
  // 👇 From here on, authenticated is guaranteed.
  return (
    <ProtectedProviders>
      <ProtectedShell>{children}</ProtectedShell>
    </ProtectedProviders>
  );
}
