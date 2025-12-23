// src/app/(protected)/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function ProtectedPage() {
  const testSignOut = function () {
    signOut();
  };

  return (
    <div className="h-40">
      This portal is the portfolio of Sunghwan Jung for demo.
      <Button
        className="mt-6 h-12 rounded-lg text-base font-normal w-full"
        type="button"
        onClick={testSignOut}
      >
        logout
      </Button>
    </div>
  );
}
