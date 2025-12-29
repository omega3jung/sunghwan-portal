import { AccessLevel, MenuItem } from "@/types";

export function filterMenuByAccessLevel(
  items: MenuItem[],
  userAccessLevel?: AccessLevel
): MenuItem[] {
  const level = userAccessLevel ?? 0;

  return items
    .filter((item) => {
      if (!item.minAccessLevel) return true;
      return level >= item.minAccessLevel;
    })
    .map((item) => {
      if (!item.children) return item;

      const children = filterMenuByAccessLevel(item.children, userAccessLevel);

      // remove parent if no children are accessible.
      if (children.length === 0) return null;

      return { ...item, children };
    })
    .filter(Boolean) as MenuItem[];
}
