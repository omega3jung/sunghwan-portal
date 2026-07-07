import { FileUp } from "lucide-react";
import type { ChangeEvent, DragEvent, RefObject } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/shared/utils/presentation";

type FileAttachmentDropzoneProps = {
  files: File[];
  maxCount: number;
  onSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onDrop: (files: FileList) => void;
  inputRef: RefObject<HTMLInputElement>;
  accept?: string[];
};

export const FileAttachmentDropzone = ({
  files,
  maxCount,
  onSelect,
  onDrop,
  inputRef,
  accept,
}: FileAttachmentDropzoneProps) => {
  const { t } = useTranslation("FileAttachment");

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (!event.dataTransfer.files?.length) {
      return;
    }

    onDrop(event.dataTransfer.files);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={files.length >= maxCount}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragEnter={(event) => event.preventDefault()}
        onDragOver={(event) => event.preventDefault()}
        className={cn(
          "rounded-xs h-32 w-full border border-dashed",
          files.length >= maxCount &&
            "cursor-not-allowed border-gray-500 bg-gray-50 text-gray-500",
        )}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 font-semibold text-primary">
            <FileUp />
            <h5 className="text-base">{t("dragDrop")}</h5>
          </div>
          <h5 className="font-normal">{t("uploadFile")}</h5>
        </div>
      </Button>

      <Input
        ref={inputRef}
        type="file"
        multiple
        accept={accept?.join(",")}
        className="hidden"
        onChange={onSelect}
      />
    </>
  );
};
