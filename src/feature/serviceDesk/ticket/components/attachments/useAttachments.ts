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

import { NS } from "@/lib/i18n";
import { bytesToMB } from "@/shared/utils";

type AttachmentFiles = File[];

export type AttachmentFieldPath<TForm extends FieldValues> = FieldPathByValue<
  TForm,
  AttachmentFiles
>;

export type AttachmentErrorType = "count" | "size" | "type";

type UseAttachmentsOptions<
  TForm extends FieldValues,
  TFieldName extends AttachmentFieldPath<TForm>,
> = {
  form: UseFormReturn<TForm>;
  name: TFieldName;
  maxCount: number;
  maxSizeMB: number;
  accept?: string[];
  onError?: (type: AttachmentErrorType) => void;
};

export const useAttachments = <
  TForm extends FieldValues,
  TFieldName extends AttachmentFieldPath<TForm>,
>({
  form,
  name,
  maxCount,
  maxSizeMB,
  accept,
  onError,
}: UseAttachmentsOptions<TForm, TFieldName>) => {
  const { t } = useTranslation(NS.message);

  const watchedFiles = useWatch<TForm, TFieldName>({
    control: form.control,
    name,
  });
  const files = useMemo<AttachmentFiles>(() => watchedFiles ?? [], [watchedFiles]);
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const totalSizeMB = useMemo(() => {
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

  const setFiles = (nextFiles: AttachmentFiles) => {
    form.setValue(name, nextFiles as PathValue<TForm, TFieldName>);
  };

  const addFiles = (input: FileList | AttachmentFiles) => {
    const selectedFiles = Array.from(input);
    const invalidType = selectedFiles.find((file) => !isValidType(file));

    if (invalidType) {
      onError?.("type");
      toast.warning(t("validation.fileTypeError"));
      return;
    }

    const mergedFiles = [...files, ...selectedFiles];
    const uniqueFiles = mergedFiles.filter(
      (file, index, array) =>
        array.findIndex(
          (candidate) =>
            candidate.name === file.name && candidate.size === file.size,
        ) === index,
    );

    if (uniqueFiles.length > maxCount) {
      onError?.("count");
      toast.warning(t("validation.titleError", { count: maxCount }), {
        description: t("file.maxCount", { count: maxCount }),
      });
      return;
    }

    const totalSize = uniqueFiles.reduce((acc, file) => acc + file.size, 0);

    if (totalSize > maxSizeBytes) {
      onError?.("size");
      toast.warning(t("validation.titleError", { size: maxSizeMB }), {
        description: t("file.maxSize", { count: maxSizeMB }),
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
    totalSizeMB,
    addFiles,
    removeFile,
    clear,
  };
};
