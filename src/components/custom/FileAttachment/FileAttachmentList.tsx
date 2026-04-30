import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { bytesToKB } from "@/shared/utils/browser";

type FileAttachmentListProps = {
  files: File[];
  onRemove?: (index: number) => void;
  totalFileSizeMB: number;
  maxCount: number;
  maxSizeMB: number;
};

export const FileAttachmentList = ({
  files,
  onRemove,
  totalFileSizeMB,
  maxCount,
  maxSizeMB,
}: FileAttachmentListProps) => {
  const { t } = useTranslation("FileAttachment");

  return (
    <>
      <div className="max-h-48 space-y-2 overflow-y-auto">
        {files.length === 0 ? (
          <div className="text-sm text-muted-foreground">{t("noFiles")}</div>
        ) : null}

        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="flex items-center justify-between rounded-md border px-3 py-2"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {bytesToKB(file.size)} KB
              </span>
            </div>

            {onRemove ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => onRemove(index)}
              >
                <Trash2 size={18} />
              </Button>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-3 flex justify-between text-sm text-muted-foreground">
        <span>
          {t("totalFiles")} : {files.length}/{maxCount}
        </span>
        <span>
          {totalFileSizeMB}/{maxSizeMB} MB
        </span>
      </div>
    </>
  );
};
