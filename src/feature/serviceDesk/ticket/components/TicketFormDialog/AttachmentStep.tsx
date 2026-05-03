import { FileAttachment } from "@/components/custom/FileAttachment";
import { Field, FieldGroup } from "@/components/ui/field";
import {
  MAX_ATTACH_COUNT,
  MAX_ATTACH_SIZE,
} from "@/feature/serviceDesk/ticket/constants";

import { useTicketFormContext } from "../../context/TicketFormContext";

export const AttachmentStep = () => {
  const { form } = useTicketFormContext();

  return (
    <FieldGroup>
      <Field>
        <FileAttachment
          form={form}
          name="attachment"
          maxCount={MAX_ATTACH_COUNT}
          maxSizeMB={MAX_ATTACH_SIZE}
        />
      </Field>
    </FieldGroup>
  );
};
