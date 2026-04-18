import type { ChangeEvent } from "react";
import { useRef } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

import { Field } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";

import {
  type AttachmentErrorType,
  type AttachmentFieldPath,
  AttachmentList,
  UploadDropzone,
  useAttachments,
} from ".";

type AttachmentFieldProps<
  TForm extends FieldValues,
  TFieldName extends AttachmentFieldPath<TForm>,
> = {
  form: UseFormReturn<TForm>;
  name: TFieldName;
  maxCount: number;
  maxSizeMB: number;
  accept?: string[];
  readOnly?: boolean;
  showSeparator?: boolean;
  onError?: (type: AttachmentErrorType) => void;
  className?: string;
};

export const AttachmentField = <
  TForm extends FieldValues,
  TFieldName extends AttachmentFieldPath<TForm>,
>({
  form,
  name,
  maxCount,
  maxSizeMB,
  accept,
  readOnly = false,
  showSeparator = true,
  onError,
  className,
}: AttachmentFieldProps<TForm, TFieldName>) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { files, totalSizeMB, addFiles, removeFile } = useAttachments({
    form,
    name,
    maxCount,
    maxSizeMB,
    accept,
    onError,
  });

  const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) {
      return;
    }

    addFiles(event.target.files);
    event.target.value = "";
  };

  return (
    <Field className={className}>
      {readOnly ? null : (
        <UploadDropzone
          files={files}
          maxCount={maxCount}
          onSelect={handleSelect}
          onDrop={addFiles}
          inputRef={inputRef}
        />
      )}

      {!readOnly && showSeparator ? (
        <Separator className="mb-4 mt-2 h-0.5" />
      ) : null}

      <AttachmentList
        files={files}
        onRemove={readOnly ? undefined : removeFile}
        totalSizeMB={totalSizeMB}
        maxCount={maxCount}
        maxSizeMB={maxSizeMB}
      />
    </Field>
  );
};
