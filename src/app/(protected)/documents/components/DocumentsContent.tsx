"use client";

import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCurrentPreference } from "@/hooks/useCurrentPreference";

import { DEFAULT_DOCUMENT_ID } from "../constants/documents";
import type { DocumentGroup, DocumentResource } from "../types/documents";
import { DocumentsNavigationMenu } from "./DocumentsNavigationMenu";
import { MarkdownDocument } from "./MarkdownDocument";

type DocumentsContentProps = {
  documentGroups: DocumentGroup[];
  documentsById: Record<string, DocumentResource>;
};

// This stays client-side because document selection and preference-aware locale
// switching both depend on client state and the current saved user preference.
export function DocumentsContent({
  documentGroups,
  documentsById,
}: DocumentsContentProps) {
  const { current: userPreference } = useCurrentPreference();
  const [selectedDocumentId, setSelectedDocumentId] =
    useState(DEFAULT_DOCUMENT_ID);

  // Only Korean is treated as a special localized variant; every other locale
  // intentionally falls back to the English docs set for consistency.
  const activeLocale = userPreference.language === "ko" ? "ko" : "en";
  const selectedDocument =
    documentsById[selectedDocumentId] ?? documentsById[DEFAULT_DOCUMENT_ID];

  const renderedMarkdown =
    activeLocale === "ko"
      ? selectedDocument.content.ko
      : selectedDocument.content.en;

  const renderedPath =
    // The UI shows the real source path the reader is effectively viewing,
    // including when Korean content transparently falls back to English.
    activeLocale === "ko" && selectedDocument.hasKorean
      ? `docs/ko/${selectedDocument.relativePath}`
      : `docs/en/${selectedDocument.relativePath}`;

  return (
    <main className="min-h-full p-4">
      <span>
        <h1 className="font-semibold tracking-tight">Docs Hub</h1>
        <p className="text-sm text-muted-foreground">
          Use the navigation menu to switch between major markdown documents.
        </p>
      </span>

      <div className="mt-2 h-1 rounded bg-primary-muted" />

      <DocumentsNavigationMenu
        documentGroups={documentGroups}
        selectedDocumentId={selectedDocument.id}
        onSelectDocument={setSelectedDocumentId}
      />

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>{selectedDocument.title}</CardTitle>
          <CardDescription className="flex flex-col gap-1">
            <span>{selectedDocument.description}</span>
            <span className="font-mono text-xs text-muted-foreground/90">
              {renderedPath}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MarkdownDocument markdown={renderedMarkdown} />
        </CardContent>
      </Card>
    </main>
  );
}
