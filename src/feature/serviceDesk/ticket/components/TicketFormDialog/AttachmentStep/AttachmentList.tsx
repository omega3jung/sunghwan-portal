import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { bytesToKB } from "@/shared/utils";

type AttachmentListProps = {
  files: File[];
  onRemove?: (index: number) => void;
  totalSizeMB: number;
  maxCount: number;
  maxSize: number;
};

export const AttachmentList = ({
  files,
  onRemove,
  totalSizeMB,
  maxCount,
  maxSize,
}: AttachmentListProps) => {
  const { t } = useTranslation("serviceHub");

  return (
    <>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {files.length === 0 && (
          <div className="text-sm text-muted-foreground">
            {t("general.noAttaches")}
          </div>
        )}

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

            {
              /* if onRemove is undefined, then read only list. */
              onRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => onRemove(index)}
                >
                  <Trash2 size={18} />
                </Button>
              )
            }
          </div>
        ))}
      </div>

      <div className="mt-3 flex justify-between text-sm text-muted-foreground">
        <span>
          {t("attachList.total")} : {files.length}/{maxCount}
        </span>
        <span>
          {totalSizeMB}/{maxSize} MB
        </span>
      </div>
    </>
  );
};
