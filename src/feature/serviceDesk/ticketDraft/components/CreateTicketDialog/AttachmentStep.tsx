import { FileAttachment } from "@/components/custom/FileAttachment";
import { Field, FieldGroup } from "@/components/ui/field";
import {
  MAX_ATTACH_COUNT,
  MAX_ATTACH_SIZE,
  TICKET_ATTACHMENT_ACCEPT,
} from "@/feature/serviceDesk/ticket/constants";

import { useTicketFormContext } from "../../context/TicketFormContext";

export const AttachmentStep = () => {
  const { form } = useTicketFormContext();

  return (
    <FieldGroup className="min-w-0">
      <Field className="min-w-0">
        <FileAttachment
          form={form}
          name="attachment"
          maxCount={MAX_ATTACH_COUNT}
          maxSizeMB={MAX_ATTACH_SIZE}
          accept={TICKET_ATTACHMENT_ACCEPT}
        />
      </Field>
    </FieldGroup>
  );
};
