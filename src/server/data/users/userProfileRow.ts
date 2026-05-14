import { LocalizedName } from "@/domain/organization";

export type UserProfileRow = {
  aa_id: string;
  e_id: number;
  e_user_name: string;
  ename: LocalizedName;
  e_email: string | null;
  e_cid: number;
};
