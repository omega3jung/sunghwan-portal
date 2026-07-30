"use client";

import { Button } from "@/components/ui/button";

import {
  ServiceDeskSettingsPageHeader,
  ServiceDeskSettingsReadOnlyBanner,
} from "../components/ServiceDeskSettingsPageHeader";
import { ServiceDeskSettingsPageLoading } from "../components/ServiceDeskSettingsPageLoading";
import { ServiceDeskSettingsToolbar } from "../components/ServiceDeskSettingsToolbar";
import { AssignmentRuleForm } from "./components/AssignmentRuleForm";
import { AssignmentRuleTree } from "./components/AssignmentRuleTree";
import { useAssignmentRuleSettings } from "./hooks/useAssignmentRuleSettings";

export default function AssignmentRulePage() {
  const settings = useAssignmentRuleSettings();

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
    <div className="flex flex-col gap-4 p-2">
      <ServiceDeskSettingsPageHeader
        title={settings.title}
        description={settings.description}
        canReset={settings.canReset}
        onReset={settings.onReset}
        canSave={settings.canSave}
        onSave={settings.onSave}
        isSaving={settings.isSaving}
      />

      <ServiceDeskSettingsToolbar controls={settings.toolbar} />

      <ServiceDeskSettingsReadOnlyBanner
        access={settings.access}
        managedBy={settings.managedBy}
      />

      <div className="grid min-h-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="min-w-0">
          <AssignmentRuleTree
            tree={settings.tree.tree}
            setTree={settings.tree.setTree}
            selectedId={settings.tree.selectedId}
            setSelectedId={settings.tree.setSelectedId}
            language={settings.toolbar.language.value}
            errors={settings.tree.errors}
          />
        </div>

        <div className="min-w-0">
          <AssignmentRuleForm
            selectedNode={settings.tree.selectedNode}
            inheritedAssignee={settings.tree.inheritedAssignee}
            language={settings.toolbar.language.value}
            onChange={settings.tree.updateSelectedNode}
            readOnly={settings.tree.readOnly}
            scope={settings.toolbar.scope.value}
            companyId={settings.companyId}
          />
        </div>
      </div>
    </div>
  );
}
