"use client";

import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { NS } from "@/lib/application/i18n";

import {
  ServiceDeskSettingsPageHeader,
  ServiceDeskSettingsReadOnlyBanner,
} from "../../components/ServiceDeskSettingsPageHeader";
import { ServiceDeskSettingsPageLoading } from "../../components/ServiceDeskSettingsPageLoading";
import { ServiceDeskSettingsToolbar } from "../../components/ServiceDeskSettingsToolbar";
import { useCategorySettings } from "../hooks/useCategorySettings";
import { CategoryForm } from "./CategoryForm";
import { CategoryTree } from "./CategoryTree";

export function CategoryPage() {
  const settings = useCategorySettings();
  const { t } = useTranslation(NS.settings);

  if (settings.isLoading) {
    return <ServiceDeskSettingsPageLoading />;
  }

  if (settings.errorMessage) {
    return (
      <div className="flex h-40 w-full flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">{settings.errorMessage}</p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={settings.onRetry}
        >
          {settings.retryLabel}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-185px)] flex-col gap-4 p-2">
      <ServiceDeskSettingsPageHeader
        title={settings.title}
        description={settings.description}
        canReset={settings.canReset}
        onReset={settings.onReset}
        canSave={settings.canSave}
        onSave={settings.onSave}
        isSaving={settings.isSaving}
      />

      <ServiceDeskSettingsToolbar
        controls={settings.toolbar}
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-primary/90 shadow-sm"
            disabled={
              !settings.selectedTenant ||
              !settings.tree.canEdit ||
              settings.isSaving
            }
            onClick={() =>
              settings.tree.addCategory(settings.toolbar.scope.value)
            }
          >
            {t("serviceDeskSettings.categoryTab.addCategory")}
          </Button>
        }
      />

      <ServiceDeskSettingsReadOnlyBanner
        access={settings.access}
        managedBy={settings.managedBy}
      />

      <div className="grid min-h-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <CategoryTree
          tree={settings.tree.tree}
          setTree={settings.tree.setTree}
          selectedId={settings.tree.selectedId}
          setSelectedId={settings.tree.setSelectedId}
          addSubCategory={settings.tree.addSubCategory}
          removeCategory={settings.tree.removeCategory}
          language={settings.toolbar.language.value}
          isLoading={settings.isSaving}
          canEdit={settings.tree.canEdit}
        />

        <CategoryForm
          selectedNode={settings.tree.selectedNode}
          parentCategory={settings.tree.selectedParentCategory}
          language={settings.toolbar.language.value}
          availableScopes={settings.toolbar.scope.availableScopes}
          onChange={settings.tree.updateSelectedNode}
          canEdit={settings.tree.canEdit}
        />
      </div>
    </div>
  );
}
