import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { AccessLevel, Role, UserScope } from "@/domain/auth";
import {
  createUserPreferenceByKey,
  getUserPreferenceByKey,
  getUserProfileDtoByUsername,
  updateUserPreferenceByKey,
} from "@/server/data/users";
import { PortalApiJsonOptions } from "@/server/portalApi/types";

import {
  getPortalApiQueryValue,
  normalizePath,
  parsePreferenceKey,
  resolveAccessLevel,
  resolveRole,
} from "../utils";

const USER_PROFILE_PATH_PATTERN = /^\/users\/([^/]+)\/profile$/;
const USER_PREFERENCE_PATH_PATTERN = /^\/users\/([^/]+)\/preference$/;
export async function handleUserPortalApi(
  request: NextRequest,
  options: PortalApiJsonOptions,
) {
  const apiPath = normalizePath(options.path);
  const profileMatch = USER_PROFILE_PATH_PATTERN.exec(apiPath);
  const preferenceMatch = USER_PREFERENCE_PATH_PATTERN.exec(apiPath);

  if (!profileMatch && !preferenceMatch) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const method = options.method ?? "GET";

  try {
    // api/users/[userId]/preference.
    if (preferenceMatch) {
      // REST api GET.
      if (method === "GET") {
        const username = decodeURIComponent(preferenceMatch[1] ?? "");
        const preferenceKey = getPortalApiQueryValue(
          request,
          options,
          "preferenceKey",
        );

        if (!preferenceKey) {
          return NextResponse.json(
            { message: "path and preferenceKey are required." },
            { status: 400 },
          );
        }

        const preference = await getUserPreferenceByKey({
          username,
          preferenceKey,
        });

        return NextResponse.json({
          data: preference?.preferenceMeta ?? null,
        });
      }

      // REST api POST or PUT.
      if (method === "POST" || method === "PUT") {
        const username = decodeURIComponent(preferenceMatch[1] ?? "");
        const body =
          options.body && typeof options.body === "object"
            ? (options.body as Record<string, unknown>)
            : null;
        const preferenceKey =
          typeof body?.preferenceKey === "string"
            ? body.preferenceKey
            : getPortalApiQueryValue(request, options, "preferenceKey");
        const preferenceMeta =
          body && "preferenceMeta" in body
            ? body.preferenceMeta
            : getPortalApiQueryValue(request, options, "preferenceMeta");

        if (!preferenceKey) {
          return NextResponse.json(
            { message: "path and preferenceKey are required." },
            { status: 400 },
          );
        }

        const { moduleKey, preferenceType } = parsePreferenceKey(preferenceKey);

        const preference =
          method === "POST"
            ? await createUserPreferenceByKey({
                username,
                moduleKey,
                preferenceType,
                preferenceMeta,
              })
            : await updateUserPreferenceByKey({
                username,
                moduleKey,
                preferenceType,
                preferenceMeta,
              });

        return NextResponse.json({
          data: preference?.preferenceMeta ?? null,
        });
      }
    }

    // api/users/[userId]/profile.
    if (profileMatch) {
      if (method === "GET") {
        const username = decodeURIComponent(profileMatch[1] ?? "");

        const authContext = await resolveUserProfileAuthContext(request);

        if (!authContext) {
          return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 },
          );
        }

        const profile = await getUserProfileDtoByUsername(
          username,
          authContext,
        );

        if (!profile) {
          return NextResponse.json({ message: "Not found" }, { status: 404 });
        }

        return NextResponse.json({ data: profile });
      }
    }

    return NextResponse.json({ message: "Not found" }, { status: 404 });
  } catch {
    return NextResponse.json(
      { message: options.errorMessage },
      { status: 500 },
    );
  }
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
