"use client";

import { Workflow } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { NS } from "@/lib/application/i18n";
import { cn } from "@/shared/utils/presentation";

import {
  ServiceDeskSettingsPageHeader,
  ServiceDeskSettingsReadOnlyBanner,
} from "../../components/ServiceDeskSettingsPageHeader";
import { ServiceDeskSettingsPageLoading } from "../../components/ServiceDeskSettingsPageLoading";
import { ServiceDeskSettingsToolbar } from "../../components/ServiceDeskSettingsToolbar";
import { useApprovalStepSettings } from "../hooks/useApprovalStepSettings";
import { ApprovalStepForm } from "./ApprovalStepForm";
import { ApprovalStepperPanel } from "./ApprovalStepperPanel";
import { ApprovalStepTree } from "./ApprovalStepTree";

export function ApprovalStepPage() {
  const [isStepperAsideOpen, setIsStepperAsideOpen] = useState(false);
  const settings = useApprovalStepSettings();
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
    <div className="flex min-h-[calc(100dvh-185px)] min-w-0 max-w-full flex-col gap-4 overflow-x-hidden p-2">
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
            className="hidden rounded-md xl:inline-flex"
            title={settings.title}
            aria-controls="approval-stepper-aside"
            aria-expanded={isStepperAsideOpen}
            onClick={() => {
              setIsStepperAsideOpen((previous) => !previous);
            }}
          >
            <Workflow
              className={cn(
                "h-4 w-4 transition-transform",
                isStepperAsideOpen && "text-primary",
              )}
            />
            {t("serviceDeskSettings.common.approvalStepList")}
          </Button>
        }
      />

      <ServiceDeskSettingsReadOnlyBanner
        access={settings.access}
        managedBy={settings.managedBy}
      />

      <div className="flex min-h-0 min-w-0 max-w-full flex-1 overflow-x-hidden">
        <main className="grid min-h-0 min-w-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <ApprovalStepTree
            tree={settings.tree.tree}
            setTree={settings.tree.setTree}
            selectedId={settings.tree.selectedId}
            setSelectedId={settings.tree.setSelectedId}
            addApprovalStep={settings.tree.addApprovalStep}
            removeApprovalStep={settings.tree.removeApprovalStep}
            language={settings.toolbar.language.value}
            isLoading={settings.isSaving}
            errors={settings.tree.errors}
            canEdit={settings.tree.canEdit}
          />

          <ApprovalStepForm
            selectedNode={settings.tree.selectedNode}
            language={settings.toolbar.language.value}
            onChange={settings.tree.updateSelectedNode}
            canEdit={settings.tree.canEdit}
            companyId={settings.companyId}
          />
        </main>

        <div
          className={cn(
            "hidden overflow-hidden transition-[width] duration-200 ease-linear xl:block",
            isStepperAsideOpen ? "w-80" : "w-0",
          )}
        >
          <aside
            id="approval-stepper-aside"
            aria-label={settings.title}
            className={cn(
              "h-full w-80 shrink-0 pl-4 transition-[opacity,transform] duration-200 ease-linear",
              isStepperAsideOpen
                ? "translate-x-0 opacity-100"
                : "pointer-events-none translate-x-2 opacity-0",
            )}
          >
            <ApprovalStepperPanel
              selectedNode={settings.tree.selectedNode}
              tree={settings.tree.tree}
              language={settings.toolbar.language.value}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
