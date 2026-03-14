import { FileUp } from "lucide-react";
import { RefObject } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/shared/utils";

type Props = {
  files: File[];
  maxCount: number;
  onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (files: FileList) => void;
  inputRef: RefObject<HTMLInputElement>;
};

export const UploadDropzone = ({
  files,
  maxCount,
  onSelect,
  onDrop,
  inputRef,
}: Props) => {
  const { t } = useTranslation("serviceHub");

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!e.dataTransfer.files?.length) return;
    onDrop(e.dataTransfer.files);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={files.length >= maxCount}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragEnter={(e) => e.preventDefault()}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          "rounded-xs h-32 w-full border border-dashed",
          files.length >= maxCount &&
            "cursor-not-allowed border-gray-500 bg-gray-50 text-gray-500",
        )}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-2 font-semibold">
            <FileUp />
            <h5 className="text-base">{t("createTicketDialog.dragDrop")}</h5>
          </div>
          <h5 className="text-base font-normal">
            {t("createTicketDialog.fileUpload")}
          </h5>
        </div>
      </Button>

      <Input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={onSelect}
      />
    </>
  );
};
