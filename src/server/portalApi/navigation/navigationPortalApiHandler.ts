import { NextRequest, NextResponse } from "next/server";

import { getLeftMenuByUsername } from "@/server/data/navigation/leftMenu";

import { PortalApiJsonOptions } from "../types";
import { normalizePath } from "../utils";

const LEFT_MENU_PATH_PATTERN = /^\/navigation\/left-menu\/([^/]+)$/;

export async function handleNavigationPortalApi(
  _request: NextRequest,
  options: PortalApiJsonOptions,
) {
  const path = normalizePath(options.path);
  const leftMenuMatch = LEFT_MENU_PATH_PATTERN.exec(path);

  const method = options.method ?? "GET";

  try {
    // api/navigation/left-menu.

    if (leftMenuMatch) {
      // REST api GET.
      if (method === "GET") {
        const username = decodeURIComponent(leftMenuMatch[1] ?? "");

        if (!username.trim()) {
          return NextResponse.json(
            { message: "Invalid username" },
            { status: 400 },
          );
        }

        const leftMenu = await getLeftMenuByUsername(username);

        return NextResponse.json({ data: leftMenu });
      }
    }
    // path not found.
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  } catch {
    return NextResponse.json(
      { message: options.errorMessage },
      { status: 500 },
    );
  }
}
