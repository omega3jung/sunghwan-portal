import { LocalizedText } from "@/shared/types/language";

/** Represents company within the organization domain. */
export interface Company {
  id: string;

  // basic info
  name: LocalizedText;
  code?: string;

  // ownership
  isPortalOwner: boolean;

  // system
  active: boolean;
}
