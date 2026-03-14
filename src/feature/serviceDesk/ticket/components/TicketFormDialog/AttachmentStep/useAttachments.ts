import { useMemo } from "react";
import {
  FieldPath,
  FieldValues,
  UseFormReturn,
  useWatch,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { NS } from "@/lib/i18n";
import { bytesToMB } from "@/shared/utils";

type Options<TForm extends FieldValues, TFieldName extends FieldPath<TForm>> = {
  form: UseFormReturn<TForm>;
  fileField: TFieldName;
  maxCount: number;
  maxSizeMB: number;
  accept?: string[];
  onError?: (type: "count" | "size" | "type") => void;
};

export const useAttachments = <
  TForm extends FieldValues,
  TFieldName extends FieldPath<TForm>,
>({
  form,
  fileField,
  maxCount,
  maxSizeMB,
  accept,
  onError,
}: Options<TForm, TFieldName>) => {
  const { t } = useTranslation(NS.message);

  const files = useWatch<TForm, TFieldName>({
    control: form.control,
    name: fileField,
  }) as File[];

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const totalSizeMB = useMemo(() => {
    const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
    return bytesToMB(totalBytes);
  }, [files]);

  const isValidType = (file: File) => {
    if (!accept?.length) return true;

    return accept.some((type) => {
      if (type.endsWith("/*")) {
        const base = type.split("/")[0];
        return file.type.startsWith(base);
      }
      return file.type === type;
    });
  };

  const addFiles = (input: FileList | File[]) => {
    const selected = Array.from(input);

    const invalidType = selected.find((file) => !isValidType(file));

    if (invalidType) {
      onError?.("type");
      toast.warning(t("validation.fileTypeError"));
      return;
    }

    const merged = [...files, ...selected];

    const unique = merged.filter(
      (file, index, arr) =>
        arr.findIndex((f) => f.name === file.name && f.size === file.size) ===
        index,
    );

    if (unique.length > maxCount) {
      onError?.("count");

      toast.warning(t("validation.titleError", { count: maxCount }), {
        description: t("file.maxCount", { count: maxCount }),
      });

      return;
    }

    const totalSize = unique.reduce((acc, file) => acc + file.size, 0);

    if (totalSize > maxSizeBytes) {
      onError?.("size");

      toast.warning(t("validation.titleError", { size: maxSizeMB }), {
        description: t("file.maxSize", { count: maxSizeMB }),
      });

      return;
    }

    form.setValue(fileField, unique.slice(0, maxCount) as any);
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    form.setValue(fileField, updated as any);
  };

  const clear = () => {
    form.setValue(fileField, [] as any);
  };

  return {
    files,
    totalSizeMB,
    addFiles,
    removeFile,
    clear,
  };
};
