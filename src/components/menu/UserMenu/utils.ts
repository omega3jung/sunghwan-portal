import {
  CircleSlash,
  Contact,
  type LucideIcon,
  User,
  UserCog,
  UserKey,
  UserStar,
} from "lucide-react";
import { createElement, type ReactElement } from "react";

import { ACCESS_LEVEL, AccessLevel, Role } from "@/domain/auth";
import { AppUser } from "@/domain/user";
import { getLocalizedText } from "@/lib/application/i18n";

const permissionIconByAccessLevel: Record<AccessLevel, LucideIcon> = {
  [ACCESS_LEVEL.ADMIN]: UserStar,
  [ACCESS_LEVEL.MANAGER]: UserCog,
  [ACCESS_LEVEL.LEADER]: UserKey,
  [ACCESS_LEVEL.USER]: User,
  [ACCESS_LEVEL.GUEST]: Contact,
  [ACCESS_LEVEL.NONE]: CircleSlash,
};

const resolveAccessLevel = (permission: AccessLevel | Role): AccessLevel => {
  return typeof permission === "string" ? ACCESS_LEVEL[permission] : permission;
};

export const getPermissionIcon = (
  permission: AccessLevel | Role,
): ReactElement => {
  const accessLevel = resolveAccessLevel(permission);
  const Icon = permissionIconByAccessLevel[accessLevel] ?? Contact;

  return createElement(Icon);
};

export const getDisplayNameKey = (displayName: AppUser["displayName"]) => {
  return (getLocalizedText(displayName, "en") ?? "").replaceAll(" ", "");
};
