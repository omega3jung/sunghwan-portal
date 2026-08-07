import { LeftMenuDto } from "./leftMenuDto";
import { mapLeftMenuRowsToDtos } from "./leftMenuMapper";
import { findLeftMenuRowsByUsername } from "./leftMenuRepository";

/** Loads left menu by username through the server data boundary. */
export async function getLeftMenuByUsername(
  username: string,
): Promise<LeftMenuDto[]> {
  const rows = await findLeftMenuRowsByUsername(username);

  return mapLeftMenuRowsToDtos(rows);
}
