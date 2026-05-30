import { NextResponse } from "next/server";

import {
  getImpersonationTargetAuthUser,
  verifyLoginCredentials,
} from "../data/auth/accounts";
import { normalizePath } from "../portalApi/utils";
import { AuthApiJsonOptions } from "./types";

const LOGIN_PATH_PATTERN = /^\/auth\/login$/;
const IMPERSONATION_PATH_PATTERN = /^\/auth\/impersonation\/([^/]+)$/;

export async function dispatchAuthApi(options: AuthApiJsonOptions) {
  const path = normalizePath(options.path);

  // allow auth api path only.
  if (!path.startsWith("/auth")) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const loginMatch = LOGIN_PATH_PATTERN.exec(path);
  const impersonationMatch = IMPERSONATION_PATH_PATTERN.exec(path);

  const method = options.method ?? "POST";

  try {
    // REST api GET.
    if (method === "GET") {
      // api/auth/impersonation.
      if (impersonationMatch) {
        const username = impersonationMatch[1] ?? "";

        const impersonatedUser = await getImpersonationTargetAuthUser(username);

        return NextResponse.json({ data: impersonatedUser });
      }
    }

    // REST api POST.
    if (method === "POST") {
      // api/auth/login.
      if (loginMatch) {
        const body = options.body as {
          username?: string;
          password?: string;
        };

        const verifiedUser = await verifyLoginCredentials(
          body.username ?? "",
          body.password ?? "",
        );

        if (!verifiedUser) {
          return NextResponse.json(
            { message: "INVALID_CREDENTIALS" },
            { status: 401 },
          );
        }

        return NextResponse.json({ data: verifiedUser });
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
