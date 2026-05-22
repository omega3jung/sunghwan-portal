import { AccessLevel } from "@/domain/auth";
import { LocalizedText } from "@/shared/types";

export type LeftMenuDto = {
  id: number;
  parentId: number | null;
  title: LocalizedText;
  path: string;
  icon: string;
  type: "PAGE" | "GROUP";
  area: "CONTENT" | "FOOTER";
  order: number;
  minAccessLevel: AccessLevel;
};
