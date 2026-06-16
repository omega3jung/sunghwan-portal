"use client";

import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { NS } from "@/lib/i18n";
import { cn } from "@/shared/utils/presentation";

import type {
  DocumentGroup,
  DocumentItem,
  DocumentSection,
} from "../types/documents";

type DocumentsNavigationMenuProps = {
  documentGroups: DocumentGroup[];
  selectedDocumentId: string;
  onSelectDocument: (documentId: string) => void;
};

type DocumentMenuItemButtonProps = {
  item: DocumentItem;
  selected: boolean;
  onSelect: (documentId: string) => void;
};

type FlatDocumentListProps = {
  items: DocumentItem[];
  selectedDocumentId: string;
  onSelectDocument: (documentId: string) => void;
};

type SectionedDocumentListProps = {
  sections: DocumentSection[];
  selectedDocumentId: string;
  onSelectDocument: (documentId: string) => void;
  isDecisionLog: boolean;
};

const DECISION_LOG_GROUP_ID = "decision-log";

const documentMenuItemButtonClassName =
  "h-auto w-full flex-col items-start justify-start gap-0 whitespace-normal px-3 py-2 text-left font-normal";

const documentMenuItemDescriptionClassName =
  "mt-0.5 line-clamp-2 block text-xs font-normal leading-5 text-muted-foreground";

function DocumentMenuItemButton({
  item,
  selected,
  onSelect,
}: DocumentMenuItemButtonProps) {
  const { t } = useTranslation(NS.documents);

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => onSelect(item.id)}
      className={cn(
        documentMenuItemButtonClassName,
        selected && "bg-primary/10 text-primary",
      )}
    >
      <span className="block text-sm font-medium">{t(item.titleKey)}</span>
      <span className={documentMenuItemDescriptionClassName}>
        {t(item.descriptionKey)}
      </span>
    </Button>
  );
}

function FlatDocumentList({
  items,
  selectedDocumentId,
  onSelectDocument,
}: FlatDocumentListProps) {
  return (
    <div className="grid gap-1 md:grid-cols-2">
      {items.map((item) => (
        <DocumentMenuItemButton
          key={item.id}
          item={item}
          selected={item.id === selectedDocumentId}
          onSelect={onSelectDocument}
        />
      ))}
    </div>
  );
}

function SectionedDocumentList({
  sections,
  selectedDocumentId,
  onSelectDocument,
  isDecisionLog,
}: SectionedDocumentListProps) {
  const { t } = useTranslation(NS.documents);

  return (
    <div
      className={cn(
        "grid gap-4",
        isDecisionLog ? "md:grid-cols-3" : "md:grid-cols-2",
      )}
    >
      {sections.map((section) => (
        <section key={section.id} className="space-y-2">
          <div className="rounded bg-muted-foreground/50">
            <h4 className="px-2 text-xs font-semibold uppercase tracking-wide text-background">
              {t(section.titleKey)}
            </h4>
          </div>

          <div className="space-y-1">
            {section.items.map((item) => (
              <DocumentMenuItemButton
                key={item.id}
                item={item}
                selected={item.id === selectedDocumentId}
                onSelect={onSelectDocument}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// This is intentionally lightweight: it exposes the curated docs groups without
// turning the page into a full explorer, tree, or search-heavy docs surface.
export function DocumentsNavigationMenu({
  documentGroups,
  selectedDocumentId,
  onSelectDocument,
}: DocumentsNavigationMenuProps) {
  const { t } = useTranslation(NS.documents);

  return (
    <NavigationMenu className="justify-start gap-2 py-3">
      <NavigationMenuList className="flex flex-wrap gap-1">
        {documentGroups.map((group) => {
          const isDecisionLog = group.id === DECISION_LOG_GROUP_ID;
          const sections = group.sections ?? [];
          const hasSectionHeaders = sections.length > 0;
          const items = hasSectionHeaders
            ? sections.flatMap((section) => section.items)
            : (group.items ?? []);

          return (
            <NavigationMenuItem key={group.id}>
              <NavigationMenuTrigger className="h-9 px-3 text-sm">
                {t(group.titleKey)}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div
                  className={cn(
                    "max-h-[60vh] max-w-[calc(100vw-2rem)] overflow-y-auto p-3 pr-4",
                    isDecisionLog ? "w-[900px]" : "w-[600px]",
                  )}
                >
                  {hasSectionHeaders ? (
                    <SectionedDocumentList
                      sections={sections}
                      selectedDocumentId={selectedDocumentId}
                      onSelectDocument={onSelectDocument}
                      isDecisionLog={isDecisionLog}
                    />
                  ) : (
                    <FlatDocumentList
                      items={items}
                      selectedDocumentId={selectedDocumentId}
                      onSelectDocument={onSelectDocument}
                    />
                  )}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
