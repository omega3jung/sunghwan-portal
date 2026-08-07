import { AccessLevel } from "@/domain/auth";
import { LocalizedText } from "@/shared/types";

/** Defines the left menu dto exchanged across the server API boundary. */
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
