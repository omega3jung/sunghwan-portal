import { useRef } from "react";

import { Field, FieldGroup } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import {
  MAX_ATTACH_COUNT,
  MAX_ATTACH_SIZE,
} from "@/feature/serviceDesk/ticket/types/constants";

import { useTicketFormContext } from "../../../context/TicketFormContext";
import { AttachmentList } from "./AttachmentList";
import { UploadDropzone } from "./UploadDropzone";
import { useAttachments } from "./useAttachments";

export const AttachmentStep = () => {
  const { form } = useTicketFormContext();

  const attachRef = useRef<HTMLInputElement>(null);

  const { files, totalSizeMB, addFiles, removeFile } = useAttachments({
    form,
    fileField: "attachment",
    maxCount: MAX_ATTACH_COUNT,
    maxSizeMB: MAX_ATTACH_SIZE,
  });

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    addFiles(e.target.files);
  };

  const handleDrop = (files: FileList) => {
    addFiles(files);
  };

  return (
    <FieldGroup>
      <Field>
        <UploadDropzone
          files={files}
          maxCount={MAX_ATTACH_COUNT}
          onSelect={handleSelect}
          onDrop={handleDrop}
          inputRef={attachRef}
        />

        <Separator className="mb-4 mt-2 h-0.5" />

        <AttachmentList
          files={files}
          onRemove={removeFile}
          totalSizeMB={totalSizeMB}
          maxCount={MAX_ATTACH_COUNT}
          maxSize={MAX_ATTACH_SIZE}
        />
      </Field>
    </FieldGroup>
  );
};
