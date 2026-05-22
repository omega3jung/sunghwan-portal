import { NextRequest, NextResponse } from "next/server";

import { getLeftMenuByAccessLevel } from "@/server/data/navigation/leftMenu";

import { PortalApiJsonOptions } from "../types";
import { normalizePath, resolveAccessLevel } from "../utils";

const LEFT_MENU_PATH_PATTERN = /^\/navigation\/left-menu\/([^/]+)$/;

export async function handleNavigationPortalApi(
  _request: NextRequest,
  options: PortalApiJsonOptions,
) {
  const path = normalizePath(options.path);
  const leftMenuMatch = LEFT_MENU_PATH_PATTERN.exec(path);

  if (!leftMenuMatch) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  if ((options.method ?? "GET") !== "GET") {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const rawAccessLevel = decodeURIComponent(leftMenuMatch[1] ?? "");
  const parsedAccessLevel = Number(rawAccessLevel);
  const userAccessLevel = resolveAccessLevel(parsedAccessLevel);

  if (userAccessLevel === null) {
    return NextResponse.json(
      { message: "Invalid access level" },
      { status: 400 },
    );
  }

  try {
    const leftMenu = await getLeftMenuByAccessLevel(userAccessLevel);

    return NextResponse.json({ data: leftMenu });
  } catch {
    return NextResponse.json(
      { message: options.errorMessage },
      { status: 500 },
    );
  }
}
