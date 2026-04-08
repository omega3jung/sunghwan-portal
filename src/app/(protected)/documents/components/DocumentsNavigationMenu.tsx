import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/shared/utils/classnames";

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
  return (
    <div className="flex flex-wrap items-start gap-2 py-3">
      {documentGroups.map((group) => (
        <NavigationMenu
          key={group.id}
          className="max-w-max flex-none justify-start"
        >
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>{group.title}</NavigationMenuTrigger>
              <NavigationMenuContent className="md:w-[520px]">
                <div className="grid gap-2 p-3 md:grid-cols-2">
                  {group.items.map((item) => {
                    const isActive = item.id === selectedDocumentId;

                    return (
                      <NavigationMenuLink asChild key={item.id}>
                        <button
                          type="button"
                          onClick={() => onSelectDocument(item.id)}
                          className={cn(
                            "flex h-full w-full flex-col rounded-lg border border-border/70 bg-background px-3 py-3 text-left transition-colors hover:border-primary/30 hover:bg-accent/20",
                            isActive && "border-primary/40 bg-primary/5",
                          )}
                        >
                          <span className="text-sm font-medium text-foreground">
                            {item.title}
                          </span>
                          <span className="mt-1 text-sm leading-6 text-muted-foreground">
                            {item.description}
                          </span>
                        </button>
                      </NavigationMenuLink>
                    );
                  })}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      ))}
    </div>
  );
}
