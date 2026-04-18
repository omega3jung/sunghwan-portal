import { FieldGroup } from "@/components/ui/field";
import { AttachmentField } from "@/feature/serviceDesk/ticket/components/attachments";
import {
  MAX_ATTACH_COUNT,
  MAX_ATTACH_SIZE,
} from "@/feature/serviceDesk/ticket/types/constants";

import { useTicketFormContext } from "../../context/TicketFormContext";

export const AttachmentStep = () => {
  const { form } = useTicketFormContext();

  return (
    <FieldGroup>
      <AttachmentField
        form={form}
        name="attachment"
        maxCount={MAX_ATTACH_COUNT}
        maxSizeMB={MAX_ATTACH_SIZE}
      />
    </FieldGroup>
  );
};
