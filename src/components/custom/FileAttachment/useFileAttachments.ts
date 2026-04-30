import { useMemo } from "react";
import {
  type FieldPathByValue,
  type FieldValues,
  type PathValue,
  type UseFormReturn,
  useWatch,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { bytesToMB } from "@/shared/utils/browser";

type FileValue = File[];

export type FileAttachmentFieldPath<TForm extends FieldValues> =
  FieldPathByValue<TForm, FileValue>;

export type FileAttachmentErrorType = "count" | "size" | "type";

type UseFileAttachmentsOptions<
  TForm extends FieldValues,
  TFieldName extends FileAttachmentFieldPath<TForm>,
> = {
  form: UseFormReturn<TForm>;
  name: TFieldName;
  maxCount: number;
  maxSizeMB: number;
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
  accept,
  onError,
}: UseFileAttachmentsOptions<TForm, TFieldName>) => {
  const { t } = useTranslation("FileAttachment");

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

  const addFiles = (input: FileList | FileValue) => {
    const incomingFiles = Array.from(input);
    const invalidFile = incomingFiles.find((file) => !isValidType(file));

    if (invalidFile) {
      onError?.("type");
      toast.warning(t("invalidFileType"));
      return;
    }

    const mergedFiles = [...files, ...incomingFiles];
    const uniqueFiles = mergedFiles.filter(
      (file, index, array) =>
        array.findIndex(
          (candidate) =>
            candidate.name === file.name && candidate.size === file.size,
        ) === index,
    );

    if (uniqueFiles.length > maxCount) {
      onError?.("count");
      toast.warning(t("fileLimitTitle"), {
        description: t("maxFileCount", { count: maxCount }),
      });
      return;
    }

    const totalSizeBytes = uniqueFiles.reduce(
      (acc, file) => acc + file.size,
      0,
    );

    if (totalSizeBytes > maxSizeBytes) {
      onError?.("size");
      toast.warning(t("fileLimitTitle"), {
        description: t("maxTotalFileSize", { size: maxSizeMB }),
      });
      return;
    }

    setFiles(uniqueFiles.slice(0, maxCount));
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
