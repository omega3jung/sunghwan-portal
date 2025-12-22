// app/(public)/login/layout.tsx
"use client";

import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import { cn } from "@/utils";
import { ENVIRONMENT } from "@/lib/environment";

// force-dynamic to block cache store.
//export const dynamic = "force-dynamic";
//export const revalidate = 0;

export default function PublicLayout({ children }: { children: ReactNode }) {
  const session = useCurrentSession();

  if (session.status === "loading") {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-screen w-screen flex-col gap-12 p-4 bg-cover bg-bottom bg-no-repeat",
        "md:flex-row-reverse lg:gap-32 lg:px-32"
      )}
      style={{
        backgroundImage: `url(${ENVIRONMENT.BASE_PATH}/images/background.jpg)`,
      }}
    >
      <div className="flex grow items-center justify-center">
        <div className="flex w-full max-w-2xl justify-center">
          <img
            src={`${ENVIRONMENT.BASE_PATH}/images/logo_light.png`}
            alt={"logo"}
          />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center text-primary">
        {children}
      </div>
    </div>
  );
}
