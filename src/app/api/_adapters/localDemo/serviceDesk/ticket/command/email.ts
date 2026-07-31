import { DbTicketDetail } from "@/lib/application/contracts/serviceDesk";
import { employeesMock } from "@/mocks/domain/organization/employee";

const employeeEmailByUserName = new Map(
  employeesMock.map((employee) => [employee.e_username, employee.e_email]),
);

/** Adds resolved assignee emails to notification targets without duplicating recipients. */
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
