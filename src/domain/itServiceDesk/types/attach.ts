import { AttachFile } from "./enums";

export interface Attach {
  index: number;
  type: AttachFile;
  name: string;
  url: string;
  active: boolean;
}
