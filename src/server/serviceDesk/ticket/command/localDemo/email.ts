import { DbTicketDetail } from "@/feature/serviceDesk/ticket/api/types";
import { createEmployeesMock } from "@/mocks/domain/organization/employee";

const employeeEmailByUserName = new Map(
  createEmployeesMock().map((employee) => [
    employee.e_username,
    employee.e_email,
  ]),
);

export const mergeTicketToEmails = (
  ticket: DbTicketDetail,
  assigneeUsernames: string[],
): DbTicketDetail["email"] => {
  const assigneeEmails = assigneeUsernames
    .map((assigneeUsername) => employeeEmailByUserName.get(assigneeUsername))
    .filter((email): email is string => Boolean(email));

  if (assigneeEmails.length === 0) {
    return ticket.email;
  }

  return {
    ...ticket.email,
    to: [...new Set([...ticket.email.to, ...assigneeEmails])],
  };
};
