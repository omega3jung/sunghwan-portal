import { readFile } from "fs/promises";
import path from "path";

import { documentGroups } from "../constants/documents";
import type { DocumentResource } from "../types/documents";

// Server-side loading is isolated here so page.tsx can stay focused on route
// composition instead of filesystem details.
const documentItemsByPath = new Map(
  documentGroups
    .flatMap((group) => group.items)
    .map((item) => [item.relativePath, item]),
);

const localeRoot = {
  en: path.join(process.cwd(), "docs", "en"),
  ko: path.join(process.cwd(), "docs", "ko"),
} as const;

const readDocument = async (absolutePath: string) => {
  return readFile(absolutePath, "utf8");
};

const readLocalizedDocument = async (
  relativePath: string,
): Promise<DocumentResource> => {
  const item = documentItemsByPath.get(relativePath);

  if (!item) {
    throw new Error(`Unknown document path: ${relativePath}`);
  }

  const englishPath = path.join(localeRoot.en, relativePath);
  const koreanPath = path.join(localeRoot.ko, relativePath);
  const englishContent = await readDocument(englishPath);

  try {
    const koreanContent = await readDocument(koreanPath);

    return {
      id: item.id,
      title: item.title,
      description: item.description,
      relativePath,
      hasKorean: true,
      content: {
        en: englishContent,
        ko: koreanContent,
      },
    };
  } catch {
    // Korean is the only localized variant we special-case; when a Korean file
    // does not exist, the docs hub deliberately serves the English source.
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      relativePath,
      hasKorean: false,
      content: {
        en: englishContent,
        ko: englishContent,
      },
    };
  }
};

export const loadDocumentsById = async () => {
  // Loading a deduplicated path list keeps the config authoritative even when
  // multiple UI groupings point at the same physical markdown file later on.
  const uniqueRelativePaths = Array.from(
    new Set(
      documentGroups.flatMap((group) =>
        group.items.map((item) => item.relativePath),
      ),
    ),
  );

  const documents = await Promise.all(
    uniqueRelativePaths.map(async (relativePath) => {
      const document = await readLocalizedDocument(relativePath);

      return [document.id, document] as const;
    }),
  );

  return Object.fromEntries(documents);
};
