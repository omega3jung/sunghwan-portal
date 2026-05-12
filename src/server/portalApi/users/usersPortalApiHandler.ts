import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { AccessLevel, Role, UserScope } from "@/domain/auth";
import { getUserProfileDtoById } from "@/server/data/users";
import { PortalApiJsonOptions } from "@/server/portalApi/types";

const USER_PROFILE_PATH_PATTERN = /^\/users\/([^/]+)\/profile$/;

export async function handleUserPortalApi(
  request: NextRequest,
  options: PortalApiJsonOptions,
) {
  const path = normalizePath(options.path);
  const match = USER_PROFILE_PATH_PATTERN.exec(path);

  if (!match) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const userId = decodeURIComponent(match[1] ?? "");
  const method = options.method ?? "GET";

  if (method === "POST" || method === "PUT") {
    return NextResponse.json({ message: "Not implemented" }, { status: 501 });
  }

  if (method !== "GET") {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const authContext = await resolveUserProfileAuthContext(request);

  if (!authContext) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await getUserProfileDtoById(userId, authContext);

    console.error(profile);
    if (!profile) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch {
    return NextResponse.json(
      { message: options.errorMessage },
      { status: 500 },
    );
  }
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

async function resolveUserProfileAuthContext(request: NextRequest): Promise<{
  userScope: UserScope;
  companyId: string;
  permission: AccessLevel;
  role: Role | null;
} | null> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return null;
  }

  if (token.userScope !== "INTERNAL" && token.userScope !== "CLIENT") {
    return null;
  }

  const permission = resolveAccessLevel(token.permission);

  if (permission === null) {
    return null;
  }

  const role = resolveRole(token.role);
  const companyId =
    typeof token.companyId === "string"
      ? token.companyId
      : typeof token.clientId === "string"
        ? token.clientId
        : "";

  return {
    userScope: token.userScope,
    companyId,
    permission,
    role,
  };
}

function resolveRole(value: unknown): Role | null {
  if (
    value === "ADMIN" ||
    value === "MANAGER" ||
    value === "LEADER" ||
    value === "USER" ||
    value === "GUEST"
  ) {
    return value;
  }

  return null;
}

function resolveAccessLevel(value: unknown): AccessLevel | null {
  if (value === 9 || value === 7 || value === 5 || value === 3 || value === 1) {
    return value;
  }

  return null;
}
