import { useMemo } from "react";
import {
  type FieldPathByValue,
  type FieldValues,
  type PathValue,
  type UseFormReturn,
  useWatch,
} from "react-hook-form";
import { useTranslation } from "react-i18next";

import { toast } from "@/components/ui/toast";
import { NS } from "@/lib/application/i18n";
import { bytesToMB } from "@/shared/utils/browser";

type FileValue = File[];

export type FileAttachmentFieldPath<TForm extends FieldValues> =
  FieldPathByValue<TForm, FileValue>;

export type FileAttachmentErrorType = "count" | "size" | "type";
export type FileAttachmentLimitBehavior = "accept-available" | "reject-all";

type UseFileAttachmentsOptions<
  TForm extends FieldValues,
  TFieldName extends FileAttachmentFieldPath<TForm>,
> = {
  form: UseFormReturn<TForm>;
  name: TFieldName;
  maxCount: number;
  maxSizeMB: number;
  limitBehavior?: FileAttachmentLimitBehavior;
  accept?: string[];
  onError?: (type: FileAttachmentErrorType) => void;
};

export const useFileAttachments = <
  TForm extends FieldValues,
  TFieldName extends FileAttachmentFieldPath<TForm>,
>({
  form,
  name,
  maxCount,
  maxSizeMB,
  limitBehavior = "accept-available",
  accept,
  onError,
}: UseFileAttachmentsOptions<TForm, TFieldName>) => {
  const { t: tValidation } = useTranslation(NS.validation);
  const { t: tMessage } = useTranslation(NS.message);

  const watchedFiles = useWatch<TForm, TFieldName>({
    control: form.control,
    name,
  });
  const files = useMemo<FileValue>(() => watchedFiles ?? [], [watchedFiles]);
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const totalFileSizeMB = useMemo(() => {
    const totalBytes = files.reduce((acc, file) => acc + file.size, 0);
    return bytesToMB(totalBytes);
  }, [files]);

  const isValidType = (file: File) => {
    if (!accept?.length) {
      return true;
    }

    return accept.some((type) => {
      if (type.startsWith(".")) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }

      if (type.endsWith("/*")) {
        const baseType = type.split("/")[0];
        return file.type.startsWith(baseType);
      }

      return file.type === type;
    });
  };

  const setFiles = (nextFiles: FileValue) => {
    form.setValue(name, nextFiles as PathValue<TForm, TFieldName>);
  };

  const reportLimitError = (
    type: Extract<FileAttachmentErrorType, "count" | "size">,
  ) => {
    onError?.(type);
    toast.add({
      title: tMessage("fileAttachment.limitTitle"),
      description:
        type === "count"
          ? tValidation("fileAttachment.maxCount", { count: maxCount })
          : tValidation("fileAttachment.maxTotalSize", { size: maxSizeMB }),
      type: "warning",
    });
  };

  const addFiles = (input: FileList | FileValue) => {
    const incomingFiles = Array.from(input);
    const invalidFile = incomingFiles.find((file) => !isValidType(file));

    if (invalidFile) {
      onError?.("type");
      toast.add({
        title: tValidation("fileAttachment.invalidType"),
        type: "warning",
      });
      return;
    }

    if (limitBehavior === "reject-all") {
      const uniqueFiles = mergeUniqueFiles(files, incomingFiles);

      if (uniqueFiles.length > maxCount) {
        reportLimitError("count");
        return;
      }

      const totalSizeBytes = uniqueFiles.reduce(
        (total, file) => total + file.size,
        0,
      );

      if (totalSizeBytes > maxSizeBytes) {
        reportLimitError("size");
        return;
      }

      if (uniqueFiles.length !== files.length) {
        setFiles(uniqueFiles);
      }
      return;
    }

    const nextFiles = [...files];
    const fileKeys = new Set(
      files.map((file) => createFileKey(file)),
    );
    let totalSizeBytes = files.reduce((acc, file) => acc + file.size, 0);
    let limitError: Extract<FileAttachmentErrorType, "count" | "size"> | null =
      null;

    for (const file of incomingFiles) {
      const fileKey = createFileKey(file);

      if (fileKeys.has(fileKey)) {
        continue;
      }

      if (nextFiles.length >= maxCount) {
        limitError ??= "count";
        break;
      }

      if (totalSizeBytes + file.size > maxSizeBytes) {
        limitError ??= "size";
        continue;
      }

      nextFiles.push(file);
      fileKeys.add(fileKey);
      totalSizeBytes += file.size;
    }

    if (limitError) {
      reportLimitError(limitError);
    }

    if (nextFiles.length !== files.length) {
      setFiles(nextFiles);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, fileIndex) => fileIndex !== index));
  };

  const clear = () => {
    setFiles([]);
  };

  return {
    files,
    totalFileSizeMB,
    addFiles,
    removeFile,
    clear,
  };
};

const createFileKey = (file: File) => `${file.name}:${file.size}`;

const mergeUniqueFiles = (currentFiles: FileValue, incomingFiles: FileValue) => {
  const fileKeys = new Set(currentFiles.map((file) => createFileKey(file)));
  const uniqueFiles = [...currentFiles];

  for (const file of incomingFiles) {
    const fileKey = createFileKey(file);

    if (!fileKeys.has(fileKey)) {
      uniqueFiles.push(file);
      fileKeys.add(fileKey);
    }
  }

  return uniqueFiles;
};
