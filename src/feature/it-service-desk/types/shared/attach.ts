import { AttachFile } from "../enums";

export interface Attach {
  file_index: number;
  file_type: AttachFile;
  file_name: string;
  file_url: string;
  file_dis: boolean;
}
