import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { SessionUser } from "@/domain/auth";

export const ticketFormDefaultValues = {
  id: null,
  category: undefined,
  subject: "",
  body: "",
  dueDate: new Date(),
  priority: "Medium",
  email: {
    to: [],
    cc: [],
    bcc: [],
  },
  requester: { id: "", email: "", name: "" },
  attachment: [],
};

export const useTicketForm = (user?: SessionUser) =>
  useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),

    defaultValues: {
      ...ticketFormDefaultValues,
      requester: {
        id: user?.username,
        email: user?.email,
        name: user?.displayName,
      },
    },
  });

const ticketFormSchema = z.object({
  id: z.string().nullable(),
  category: z.string(),
  subject: z.string().max(200),
  body: z.string(),
  dueDate: z.date(),
  priority: z.string().nullable(),
  email: z.object({
    to: z.string().array(),
    cc: z.string().array(),
    bcc: z.string().array(),
  }),
  requester: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
  }),
  attachment: z.file().array(),
});

export type TicketFormValues = z.infer<typeof ticketFormSchema>;
