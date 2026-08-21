import type { LocalizedName } from "@/domain/organization";

/** Employee data required to present a portal-login impersonation candidate. */
export interface EligibleImpersonationEmployeeDto {
  username: string;
  name: LocalizedName;
  email: string;
  imageUrl: string | null;
}
