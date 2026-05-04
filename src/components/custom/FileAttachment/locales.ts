import { Locale } from "@/shared/types";

export const fileAttachmentLocales: Record<Locale, Record<string, string>> = {
  en: {
    dragDrop: "Drag and drop files here",
    uploadFile: "or click to browse",
    noFiles: "No files",
    totalFiles: "Total",
    invalidFileType: "Unsupported file type.",
    fileLimitTitle: "Please check the selected files.",
    maxFileCount: "Maximum {{count}} files allowed.",
    maxTotalFileSize: "Maximum total file size is {{size}} MB.",
  },

  es: {
    dragDrop: "Arrastra y suelta archivos aquí",
    uploadFile: "o haz clic para explorar",
    noFiles: "No hay archivos",
    totalFiles: "Total",
    invalidFileType: "Tipo de archivo no compatible.",
    fileLimitTitle: "Revisa los archivos seleccionados.",
    maxFileCount: "Se permiten como máximo {{count}} archivos.",
    maxTotalFileSize:
      "El tamaño total máximo de los archivos es de {{size}} MB.",
  },

  fr: {
    dragDrop: "Glissez-déposez les fichiers ici",
    uploadFile: "ou cliquez pour parcourir",
    noFiles: "Aucun fichier",
    totalFiles: "Total",
    invalidFileType: "Type de fichier non pris en charge.",
    fileLimitTitle: "Vérifiez les fichiers sélectionnés.",
    maxFileCount: "Maximum {{count}} fichiers autorisés.",
    maxTotalFileSize:
      "La taille totale maximale des fichiers est de {{size}} Mo.",
  },

  ko: {
    dragDrop: "여기에 파일을 끌어다 놓으세요",
    uploadFile: "또는 클릭해서 찾아보세요",
    noFiles: "파일이 없습니다",
    totalFiles: "총계",
    invalidFileType: "지원되지 않는 파일 형식입니다.",
    fileLimitTitle: "선택한 파일을 확인해주세요.",
    maxFileCount: "최대 {{count}}개 파일까지 업로드할 수 있습니다.",
    maxTotalFileSize: "전체 파일 크기는 최대 {{size}} MB까지 가능합니다.",
  },
};
