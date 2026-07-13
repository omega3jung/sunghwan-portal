import { LeftMenuDto } from "./leftMenuDto";
import { mapLeftMenuRowsToDtos } from "./leftMenuMapper";
import { findLeftMenuRowsByUsername } from "./leftMenuRepository";

export async function getLeftMenuByUsername(
  username: string,
): Promise<LeftMenuDto[]> {
  const rows = await findLeftMenuRowsByUsername(username);

  return mapLeftMenuRowsToDtos(rows);
}
