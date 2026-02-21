import { Employee } from "@/domain/user";

export type ItServiceDeskUser = Pick<
  Employee,
  "id" | "email" | "imageUrl" | "departmentId" | "clientId" | "active"
> & {
  fullName: string;
};
