"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function RemoteRouteGuard() {
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const notifiedPathnamesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (status !== "authenticated") return;
    if (session?.user?.dataScope !== "REMOTE") return;
    if (
      pathname === "/" ||
      pathname.startsWith("/demo") ||
      pathname.startsWith("/settings") ||
      pathname.startsWith("/documents")
    )
      return;

    if (!notifiedPathnamesRef.current.has(pathname)) {
      toast.error(t("remoteRouteGuard.limited.title", { ns: "message" }), {
        description: t("remoteRouteGuard.limited.description", {
          ns: "message",
        }),
        id: `remote-route-guard:${pathname}`,
        position: "top-center",
      });
      notifiedPathnamesRef.current.add(pathname);
    }

    router.replace("/");
  }, [pathname, router, session?.user?.dataScope, status, t]);

  return null;
}
