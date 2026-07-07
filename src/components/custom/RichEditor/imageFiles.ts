import type { JSONContent } from "@tiptap/core";
import type { Editor } from "@tiptap/react";

const SUPPORTED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

const SUPPORTED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp"]);

export const RICH_EDITOR_IMAGE_FILE_ACCEPT =
  "image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp";

export function getSupportedClipboardImageFiles(
  clipboardData: DataTransfer | null,
) {
  if (!clipboardData) {
    return [];
  }

  const itemFiles = Array.from(clipboardData.items)
    .filter((item) => item.kind === "file")
    .map((item) => item.getAsFile())
    .filter((file): file is File => Boolean(file))
    .filter(isSupportedRichEditorImageFile);

  if (itemFiles.length > 0) {
    return itemFiles;
  }

  return Array.from(clipboardData.files).filter(isSupportedRichEditorImageFile);
}

export function isSupportedRichEditorImageFile(file: File) {
  if (SUPPORTED_IMAGE_MIME_TYPES.has(file.type.toLowerCase())) {
    return true;
  }

  const extension = file.name.split(".").pop()?.toLowerCase();

  return extension ? SUPPORTED_IMAGE_EXTENSIONS.has(extension) : false;
}

export async function insertImageFilesAsBase64(
  editor: Editor,
  files: File[],
) {
  const content: JSONContent[] = await Promise.all(
    files.map(async (file) => ({
      type: "image",
      attrs: {
        src: await readFileAsDataUrl(file),
        ...(file.name ? { alt: file.name } : {}),
      },
    })),
  );

  editor.chain().focus().insertContent(content).run();
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(reader.error ?? new Error("Failed to read image file."));
    };
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Failed to read image file."));
    };

    reader.readAsDataURL(file);
  });
}
