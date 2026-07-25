import { FileText, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
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
  const { t } = useTranslation(["FileAttachment", "common"]);

  return (
    <>
      <div className="max-h-48 space-y-2 overflow-y-auto">
        {files.length === 0 ? (
          <div className="text-sm text-muted-foreground">{t("noFiles")}</div>
        ) : null}

        {files.map((file, index) => (
          <Attachment
            key={`${file.name}-${index}`}
            className="w-full flex-nowrap rounded-md"
          >
            <AttachmentMedia>
              <FileText />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{file.name}</AttachmentTitle>
              <AttachmentDescription>
                {bytesToKB(file.size)} KB
              </AttachmentDescription>
            </AttachmentContent>

            {onRemove ? (
              <AttachmentActions>
                <AttachmentAction
                  type="button"
                  size="icon"
                  className="text-destructive"
                  aria-label={`${t("delete", { ns: "common" })}: ${file.name}`}
                  onClick={() => onRemove(index)}
                >
                  <Trash2 />
                </AttachmentAction>
              </AttachmentActions>
            ) : null}
          </Attachment>
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
