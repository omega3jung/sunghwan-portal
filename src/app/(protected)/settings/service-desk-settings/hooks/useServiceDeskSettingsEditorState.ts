"use client";

import { useConfirmDiscardChanges } from "./useConfirmDiscardChanges";
import type { ServiceDeskSettingsPageContext } from "./useServiceDeskSettingsPageContext";

type QueryState = {
  error: unknown;
  isLoading: boolean;
  isReady: boolean;
};

type DraftState = {
  isReady: boolean;
  isDirty: boolean;
  reset: () => void;
};

export function useServiceDeskSettingsEditorState({
  pageContext,
  draft,
  isSaving,
  isValid = true,
  queries,
}: {
  pageContext: ServiceDeskSettingsPageContext;
  draft: DraftState;
  isSaving: boolean;
  isValid?: boolean;
  queries: readonly QueryState[];
}) {
  const hasUnsavedChanges = draft.isReady && draft.isDirty;
  const confirmDiscardChanges =
    useConfirmDiscardChanges(hasUnsavedChanges);
  const hasError = queries.some((query) => Boolean(query.error));
  const isQueryPending = queries.some(
    (query) => query.isLoading || !query.isReady,
  );
  const isLoading =
    !hasError &&
    (pageContext.isTenantSelectionLoading ||
      (Boolean(pageContext.selectedTenant) &&
        pageContext.canRead &&
        (isQueryPending || !draft.isReady)));
  const canReset =
    pageContext.canManage && hasUnsavedChanges && !isSaving;
  const canSave =
    pageContext.canManage &&
    hasUnsavedChanges &&
    isValid &&
    !isSaving;

  const handleScopeChange = (
    scope: typeof pageContext.selectedScope,
  ) => {
    if (
      scope === pageContext.selectedScope ||
      confirmDiscardChanges()
    ) {
      pageContext.selectScope(scope);
    }
  };

  return {
    hasError,
    isLoading,
    canReset,
    onReset: draft.reset,
    canSave,
    confirmDiscardChanges,
    toolbar: {
      onBeforeTenantChange: confirmDiscardChanges,
      scope: {
        value: pageContext.selectedScope,
        onValueChange: handleScopeChange,
        availableScopes: pageContext.availableScopes,
        canChangeScope: !isLoading && !isSaving,
      },
      language: {
        value: pageContext.language,
        onValueChange: pageContext.setLanguage,
      },
    },
  };
}
