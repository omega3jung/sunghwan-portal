import { useState } from "react";
import { useTranslation } from "react-i18next";

import { toast } from "@/components/ui/toast";
import { NS } from "@/lib/application/i18n";

/** Maintains a de-duplicated attachment list and its total byte size for ticket forms. */
export const useTicketAttachments = ({
  maxCount,
  maxSizeMB,
}: {
  maxCount: number;
  maxSizeMB: number;
}) => {
  const { t } = useTranslation(NS.serviceDesk);
  const [files, setFiles] = useState<File[]>([]);

  const addFiles = (fileList: FileList) => {
    // convert FileList to File.
    const selectedFiles = Array.from(fileList);
    const merged = files?.concat(selectedFiles);

    // validate count maximum.
    if ((merged?.length ?? 0) > maxCount) {
      toast.add({
        title: t("createTicketDialog.maximumWarningTitle"),
        description: t("createTicketDialog.maximumWarningMessage").replace(
          "${attachMaxCount}",
          maxCount.toString(),
        ),
        type: "warning",
      });

      return;
    }

    // validate size maximum.
    let sizeTotal = 0;

    merged.forEach((file) => (sizeTotal += file.size));

    if (sizeTotal > maxSizeMB) {
      toast.add({
        title: t("createTicketDialog.maxSizeWarningTitle"),
        description: t("createTicketDialog.maxSizeWarningMessage").replace(
          "${attachMaxSize}",
          maxCount.toString(),
        ),
        type: "warning",
      });

      return;
    }

    setFiles(merged?.slice(0, maxCount));
  };

  const removeFile = (index: number) => {
    const newList = [...files];

    newList.splice(index, 1);

    setFiles(newList);
  };

  return {
    files,
    addFiles,
    removeFile,
  };
};
