import { AccessLevel } from "@/domain/auth";
import { LocalizedText } from "@/shared/types";

export type LeftMenuRow = {
  pm_id: number;
  pm_parent_id: number | null;
  pm_i18n: LocalizedText;
  pm_path: string;
  pm_icon: string;
  pm_type: "PAGE" | "GROUP";
  pm_menu_area: "CONTENT" | "FOOTER";
  pm_menu_order: number;
  min_access_level: AccessLevel;
};
