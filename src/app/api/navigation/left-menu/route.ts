// src/app/api/navigation/left-menu/route.ts
import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserName, isRemoteRequest } from "@/app/api/_adapters";
import { portalApiJson } from "@/app/api/_adapters/backend";
import { getLocalLeftMenu } from "@/app/api/_adapters/localDemo/user";

export async function GET(req: NextRequest) {
  const currentUserName = await getCurrentUserName(req);

  if (!currentUserName) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const isRemote = await isRemoteRequest(req);

  if (!isRemote) {
    const leftMenu = getLocalLeftMenu(currentUserName);

    if (!leftMenu) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ data: leftMenu });
  }

  return portalApiJson(req, {
    method: "GET",
    path: `/navigation/left-menu/${encodeURIComponent(currentUserName)}`,
    errorMessage: "Failed to fetch left menu items",
  });
}
