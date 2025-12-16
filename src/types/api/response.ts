export type ApiResponse = {
  cmt: string;
  result: string;
};

export type OResponse<T = any> = {
  items: T[];
};
