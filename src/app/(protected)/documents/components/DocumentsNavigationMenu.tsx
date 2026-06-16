"use client";

import { useTranslation } from "react-i18next";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { NS } from "@/lib/i18n";
import { cn } from "@/shared/utils/presentation";

import type { DocumentGroup } from "../types/documents";

type DocumentsNavigationMenuProps = {
  documentGroups: DocumentGroup[];
  selectedDocumentId: string;
  onSelectDocument: (documentId: string) => void;
};

// This is intentionally lightweight: it exposes the curated docs groups without
// turning the page into a full explorer, tree, or search-heavy docs surface.
export function DocumentsNavigationMenu({
  documentGroups,
  selectedDocumentId,
  onSelectDocument,
}: DocumentsNavigationMenuProps) {
  const { t } = useTranslation(NS.documents);

  return (
    <NavigationMenu className="max-w-full justify-start gap-2 py-3">
      <NavigationMenuList className="flex flex-wrap gap-1">
        {documentGroups.map((group) => (
          <NavigationMenuItem key={group.id}>
            <NavigationMenuTrigger className="h-9 px-3 text-sm">
              {t(group.titleKey)}
            </NavigationMenuTrigger>

            <NavigationMenuContent>
              <div className="w-[520px] max-w-[calc(100vw-2rem)] p-2">
                <div className="max-h-[60vh] overflow-y-auto pr-1">
                  <div className="grid gap-1 md:grid-cols-2">
                    {group.items.map((item) => {
                      const isActive = item.id === selectedDocumentId;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onSelectDocument(item.id)}
                          className={cn(
                            "rounded-md px-3 py-2 text-left transition-colors",
                            "hover:bg-accent hover:text-accent-foreground",
                            isActive && "bg-primary/10 text-primary",
                          )}
                        >
                          <span className="block text-sm font-medium">
                            {t(item.titleKey)}
                          </span>
                          <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-muted-foreground">
                            {t(item.descriptionKey)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
