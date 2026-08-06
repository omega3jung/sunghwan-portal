"use client";

import type { ChangeEvent } from "react";
import { useRef } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

import { Separator } from "@/components/ui/separator";

import { FileAttachmentDropzone } from "./FileAttachmentDropzone";
import { FileAttachmentList } from "./FileAttachmentList";
import {
  type FileAttachmentErrorType,
  type FileAttachmentFieldPath,
  type FileAttachmentLimitBehavior,
  useFileAttachments,
} from "./useFileAttachments";

type FileAttachmentProps<
  TForm extends FieldValues,
  TFieldName extends FileAttachmentFieldPath<TForm>,
> = {
  form: UseFormReturn<TForm>;
  name: TFieldName;
  maxCount: number;
  maxSizeMB: number;
  limitBehavior?: FileAttachmentLimitBehavior;
  accept?: string[];
  readOnly?: boolean;
  showSeparator?: boolean;
  onError?: (type: FileAttachmentErrorType) => void;
  className?: string;
};

/**
 * Binds file selection, dropping, validation, and removal to a React Hook Form
 * field whose value is `File[]`. Read-only mode hides every mutation surface
 * while preserving the attachment summary.
 */
export const FileAttachment = <
  TForm extends FieldValues,
  TFieldName extends FileAttachmentFieldPath<TForm>,
>({
  form,
  name,
  maxCount,
  maxSizeMB,
  limitBehavior = "accept-available",
  accept,
  readOnly = false,
  showSeparator = true,
  onError,
  className,
}: FileAttachmentProps<TForm, TFieldName>) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { files, totalFileSizeMB, addFiles, removeFile } = useFileAttachments({
    form,
    name,
    maxCount,
    maxSizeMB,
    limitBehavior,
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
    <div className={className}>
      {readOnly ? null : (
        <FileAttachmentDropzone
          files={files}
          maxCount={maxCount}
          onSelect={handleSelect}
          onDrop={addFiles}
          inputRef={inputRef}
          accept={accept}
        />
      )}

      {!readOnly && showSeparator ? (
        <Separator className="mb-4 mt-2 h-0.5" />
      ) : null}

      <FileAttachmentList
        files={files}
        onRemove={readOnly ? undefined : removeFile}
        totalFileSizeMB={totalFileSizeMB}
        maxCount={maxCount}
        maxSizeMB={maxSizeMB}
      />
    </div>
  );
};
