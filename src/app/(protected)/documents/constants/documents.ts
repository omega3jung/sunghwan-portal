import type { DocumentGroup } from "../types/documents";

// Document metadata lives in one curated constant so the route, loader, and UI
// all share the same source of truth for the docs hub structure.
export const DEFAULT_DOCUMENT_ID = "readme";

export const documentGroups: DocumentGroup[] = [
  {
    id: "project",
    titleKey: "group.project.title",
    items: [
      {
        id: "readme",
        titleKey: "item.readme.title",
        descriptionKey: "item.readme.description",
        relativePath: "README.md",
      },
      {
        id: "readme-strategy",
        titleKey: "item.readmeStrategy.title",
        descriptionKey: "item.readmeStrategy.description",
        relativePath: "01-project/readme-strategy.md",
      },
    ],
  },
  {
    id: "architecture",
    titleKey: "group.architecture.title",
    items: [
      {
        id: "feature-based-structure",
        titleKey: "item.featureBasedStructure.title",
        descriptionKey: "item.featureBasedStructure.description",
        relativePath: "02-architecture/feature-based-structure.md",
      },
      {
        id: "routing-strategy",
        titleKey: "item.routingStrategy.title",
        descriptionKey: "item.routingStrategy.description",
        relativePath: "02-architecture/routing-strategy.md",
      },
      {
        id: "state-management",
        titleKey: "item.stateManagement.title",
        descriptionKey: "item.stateManagement.description",
        relativePath: "02-architecture/state-management.md",
      },
      {
        id: "auth-session-strategy",
        titleKey: "item.authSessionStrategy.title",
        descriptionKey: "item.authSessionStrategy.description",
        relativePath: "02-architecture/auth-session-strategy.md",
      },
      {
        id: "impersonation-strategy",
        titleKey: "item.impersonationStrategy.title",
        descriptionKey: "item.impersonationStrategy.description",
        relativePath: "02-architecture/impersonation-strategy.md",
      },
      {
        id: "database-strategy",
        titleKey: "item.databaseStrategy.title",
        descriptionKey: "item.databaseStrategy.description",
        relativePath: "02-architecture/database-strategy.md",
      },
    ],
  },
  {
    id: "domain",
    titleKey: "group.domain.title",
    items: [
      {
        id: "ticket-system-overview",
        titleKey: "item.ticketSystemOverview.title",
        descriptionKey: "item.ticketSystemOverview.description",
        relativePath: "03-domain/ticket/ticket-system-overview.md",
      },
      {
        id: "ticket-lifecycle",
        titleKey: "item.ticketLifecycle.title",
        descriptionKey: "item.ticketLifecycle.description",
        relativePath: "03-domain/ticket/ticket-lifecycle.md",
      },
      {
        id: "ticket-model",
        titleKey: "item.ticketModel.title",
        descriptionKey: "item.ticketModel.description",
        relativePath: "03-domain/ticket/ticket-model.md",
      },
      {
        id: "ticket-activity",
        titleKey: "item.ticketActivity.title",
        descriptionKey: "item.ticketActivity.description",
        relativePath: "03-domain/ticket/ticket-activity.md",
      },
      {
        id: "ticket-history",
        titleKey: "item.ticketHistory.title",
        descriptionKey: "item.ticketHistory.description",
        relativePath: "03-domain/ticket/ticket-history.md",
      },
      {
        id: "ticket-track-time",
        titleKey: "item.ticketTrackTime.title",
        descriptionKey: "item.ticketTrackTime.description",
        relativePath: "03-domain/ticket/ticket-track-time.md",
      },
      {
        id: "action-strategy",
        titleKey: "item.actionStrategy.title",
        descriptionKey: "item.actionStrategy.description",
        relativePath: "03-domain/ticket/strategy/action-strategy.md",
      },
      {
        id: "category-strategy",
        titleKey: "item.categoryStrategy.title",
        descriptionKey: "item.categoryStrategy.description",
        relativePath: "03-domain/ticket/strategy/category-strategy.md",
      },
      {
        id: "approval-system",
        titleKey: "item.approvalSystem.title",
        descriptionKey: "item.approvalSystem.description",
        relativePath: "03-domain/ticket/strategy/approval-system.md",
      },
      {
        id: "assignment-policy",
        titleKey: "item.assignmentPolicy.title",
        descriptionKey: "item.assignmentPolicy.description",
        relativePath: "03-domain/ticket/strategy/assignment-policy.md",
      },
      {
        id: "sla-strategy",
        titleKey: "item.slaStrategy.title",
        descriptionKey: "item.slaStrategy.description",
        relativePath: "03-domain/ticket/strategy/sla-strategy.md",
      },
    ],
  },
  {
    id: "ui-ux",
    titleKey: "group.uiUx.title",
    items: [
      {
        id: "component-boundary",
        titleKey: "item.componentBoundary.title",
        descriptionKey: "item.componentBoundary.description",
        relativePath: "04-ui-ux/component-boundary.md",
      },
      {
        id: "dialog-pattern",
        titleKey: "item.dialogPattern.title",
        descriptionKey: "item.dialogPattern.description",
        relativePath: "04-ui-ux/dialog-pattern.md",
      },
      {
        id: "form-pattern",
        titleKey: "item.formPattern.title",
        descriptionKey: "item.formPattern.description",
        relativePath: "04-ui-ux/form-pattern.md",
      },
      {
        id: "dashboard-and-insight",
        titleKey: "item.dashboardAndInsight.title",
        descriptionKey: "item.dashboardAndInsight.description",
        relativePath: "04-ui-ux/dashboard-and-insight.md",
      },
    ],
  },
  {
    id: "data-fetching",
    titleKey: "group.dataFetching.title",
    items: [
      {
        id: "react-query-strategy",
        titleKey: "item.reactQueryStrategy.title",
        descriptionKey: "item.reactQueryStrategy.description",
        relativePath: "05-data-fetching/react-query-strategy.md",
      },
    ],
  },
  {
    id: "form-design",
    titleKey: "group.formDesign.title",
    items: [
      {
        id: "ticket-form",
        titleKey: "item.ticketForm.title",
        descriptionKey: "item.ticketForm.description",
        relativePath: "06-form-design/ticket-form.md",
      },
    ],
  },
  {
    id: "i18n",
    titleKey: "group.i18n.title",
    items: [
      {
        id: "locale-structure",
        titleKey: "item.localeStructure.title",
        descriptionKey: "item.localeStructure.description",
        relativePath: "07-i18n/locale-structure.md",
      },
      {
        id: "validation-messages",
        titleKey: "item.validationMessages.title",
        descriptionKey: "item.validationMessages.description",
        relativePath: "07-i18n/validation-messages.md",
      },
    ],
  },
  {
    id: "dev-strategy",
    titleKey: "group.devStrategy.title",
    items: [
      {
        id: "development-approach",
        titleKey: "item.developmentApproach.title",
        descriptionKey: "item.developmentApproach.description",
        relativePath: "08-dev-strategy/development-approach.md",
      },
      {
        id: "service-desk-evolution",
        titleKey: "item.serviceDeskEvolution.title",
        descriptionKey: "item.serviceDeskEvolution.description",
        relativePath: "08-dev-strategy/service-desk-evolution.md",
      },
      {
        id: "service-desk-implementation-strategy",
        titleKey: "item.serviceDeskImplementationStrategy.title",
        descriptionKey: "item.serviceDeskImplementationStrategy.description",
        relativePath:
          "08-dev-strategy/service-desk-implementation-strategy.md",
      },
      {
        id: "ticket-operation-rules",
        titleKey: "item.ticketOperationRules.title",
        descriptionKey: "item.ticketOperationRules.description",
        relativePath: "08-dev-strategy/ticket-operation-rules.md",
      },
    ],
  },
  {
    id: "decision-log",
    titleKey: "group.decisionLog.title",
    items: [
      {
        id: "decision-auth-session-architecture",
        titleKey: "item.decisionAuthSessionArchitecture.title",
        descriptionKey: "item.decisionAuthSessionArchitecture.description",
        relativePath:
          "08-dev-strategy/decision-log/2025-12-auth-session-architecture.md",
      },
      {
        id: "decision-impersonation-2025-12",
        titleKey: "item.decisionImpersonation202512.title",
        descriptionKey: "item.decisionImpersonation202512.description",
        relativePath: "08-dev-strategy/decision-log/2025-12-impersonation.md",
      },
      {
        id: "decision-naming-2025-12",
        titleKey: "item.decisionNaming202512.title",
        descriptionKey: "item.decisionNaming202512.description",
        relativePath: "08-dev-strategy/decision-log/2025-12-naming.md",
      },
      {
        id: "decision-system-layout",
        titleKey: "item.decisionSystemLayout.title",
        descriptionKey: "item.decisionSystemLayout.description",
        relativePath: "08-dev-strategy/decision-log/2025-12-system-layout.md",
      },
      {
        id: "decision-category-design",
        titleKey: "item.decisionCategoryDesign.title",
        descriptionKey: "item.decisionCategoryDesign.description",
        relativePath: "08-dev-strategy/decision-log/2026-01-category-design.md",
      },
      {
        id: "decision-impersonation-2026-01",
        titleKey: "item.decisionImpersonation202601.title",
        descriptionKey: "item.decisionImpersonation202601.description",
        relativePath: "08-dev-strategy/decision-log/2026-01-impersonation.md",
      },
      {
        id: "decision-session-user-boundary-2026-01",
        titleKey: "item.decisionSessionUserBoundary202601.title",
        descriptionKey: "item.decisionSessionUserBoundary202601.description",
        relativePath:
          "08-dev-strategy/decision-log/2026-01-session-user-boundary.md",
      },
      {
        id: "decision-service-desk-settings",
        titleKey: "item.decisionServiceDeskSettings.title",
        descriptionKey: "item.decisionServiceDeskSettings.description",
        relativePath:
          "08-dev-strategy/decision-log/2026-02-service-desk-settings.md",
      },
      {
        id: "decision-service-desk",
        titleKey: "item.decisionServiceDesk.title",
        descriptionKey: "item.decisionServiceDesk.description",
        relativePath: "08-dev-strategy/decision-log/2026-03-service-desk.md",
      },
      {
        id: "decision-ticket-form-dialog",
        titleKey: "item.decisionTicketFormDialog.title",
        descriptionKey: "item.decisionTicketFormDialog.description",
        relativePath:
          "08-dev-strategy/decision-log/2026-03-ticket-form-dialog.md",
      },
      {
        id: "decision-ticket-session-2026-03",
        titleKey: "item.decisionTicketSession202603.title",
        descriptionKey: "item.decisionTicketSession202603.description",
        relativePath: "08-dev-strategy/decision-log/2026-03-ticket-session.md",
      },
      {
        id: "decision-entity-status-naming",
        titleKey: "item.decisionEntityStatusNaming.title",
        descriptionKey: "item.decisionEntityStatusNaming.description",
        relativePath:
          "08-dev-strategy/decision-log/2026-04-entity-status-naming.md",
      },
      {
        id: "decision-ticket-action",
        titleKey: "item.decisionTicketAction.title",
        descriptionKey: "item.decisionTicketAction.description",
        relativePath: "08-dev-strategy/decision-log/2026-04-ticket-action.md",
      },
      {
        id: "decision-barrel-export-boundary-2026-05",
        titleKey: "item.decisionBarrelExportBoundary202605.title",
        descriptionKey: "item.decisionBarrelExportBoundary202605.description",
        relativePath:
          "08-dev-strategy/decision-log/2026-05-barrel-export-boundary.md",
      },
      {
        id: "decision-database-role-and-access-strategy-2026-05",
        titleKey: "item.decisionDatabaseRoleAndAccessStrategy202605.title",
        descriptionKey:
          "item.decisionDatabaseRoleAndAccessStrategy202605.description",
        relativePath:
          "08-dev-strategy/decision-log/2026-05-database-role-and-access-strategy.md",
      },
      {
        id: "decision-service-desk-documentation-alignment-2026-05",
        titleKey: "item.decisionServiceDeskDocumentationAlignment202605.title",
        descriptionKey:
          "item.decisionServiceDeskDocumentationAlignment202605.description",
        relativePath:
          "08-dev-strategy/decision-log/2026-05-service-desk-documentation-alignment.md",
      },
      {
        id: "decision-service-desk-tenant-design-2026-06",
        titleKey: "item.decisionServiceDeskTenantDesign202606.title",
        descriptionKey: "item.decisionServiceDeskTenantDesign202606.description",
        relativePath:
          "08-dev-strategy/decision-log/2026-06-service-desk-tenant-design.md",
      },
      {
        id: "decision-service-desk-settings-dto-api-boundary-2026-06",
        titleKey: "item.decisionServiceDeskSettingsDtoApiBoundary202606.title",
        descriptionKey:
          "item.decisionServiceDeskSettingsDtoApiBoundary202606.description",
        relativePath:
          "08-dev-strategy/decision-log/2026-06-service-desk-settings-dto-api-boundary.md",
      },
    ],
  },
];
