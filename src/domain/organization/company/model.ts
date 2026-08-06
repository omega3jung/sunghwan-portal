import { LocalizedText } from "@/shared/types/language";

export interface Company {
  id: string;

  name: LocalizedText;
  code?: string;

  isPortalOwner: boolean;

  active: boolean;
}
