import { AccessLevel } from "@/domain/auth";

import { LeftMenuDto } from "./leftMenuDto";
import { mapLeftMenuRowsToDtos } from "./leftMenuMapper";
import { findLeftMenuRowsByAccessLevel } from "./leftMenuRepository";

export async function getLeftMenuByAccessLevel(
  userAccessLevel: AccessLevel,
): Promise<LeftMenuDto[]> {
  const rows = await findLeftMenuRowsByAccessLevel(userAccessLevel);

  return mapLeftMenuRowsToDtos(rows);
}
