import type { DocumentGroup } from "../types/documents";

// Document metadata lives in one curated constant so the route, loader, and UI
// all share the same source of truth for the docs hub structure.
export const DEFAULT_DOCUMENT_ID = "readme";

export const getDocumentGroupItems = (group: DocumentGroup) =>
  group.sections?.flatMap((section) => section.items) ?? group.items ?? [];

export const documentGroups: DocumentGroup[] = [
  {
    id: "overview",
    titleKey: "group.overview.title",
    items: [
      {
        id: "readme",
        titleKey: "item.readme.title",
        descriptionKey: "item.readme.description",
        relativePath: "README.md",
      },
      {
        id: "service-desk-evolution",
        titleKey: "item.serviceDeskEvolution.title",
        descriptionKey: "item.serviceDeskEvolution.description",
        relativePath: "01-overview/service-desk-evolution.md",
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
    sections: [
      {
        id: "core-model",
        titleKey: "section.domain.coreModel.title",
        items: [
          {
            id: "ticket-system-overview",
            titleKey: "item.ticketSystemOverview.title",
            descriptionKey: "item.ticketSystemOverview.description",
            relativePath:
              "03-domain/service-desk/ticket/ticket-system-overview.md",
          },
          {
            id: "service-desk-settings",
            titleKey: "item.serviceDeskSettings.title",
            descriptionKey: "item.serviceDeskSettings.description",
            relativePath: "03-domain/service-desk/settings.md",
          },
          {
            id: "ticket-model",
            titleKey: "item.ticketModel.title",
            descriptionKey: "item.ticketModel.description",
            relativePath: "03-domain/service-desk/ticket/ticket-model.md",
          },
        ],
      },
      {
        id: "workflow",
        titleKey: "section.domain.workflow.title",
        items: [
          {
            id: "ticket-lifecycle",
            titleKey: "item.ticketLifecycle.title",
            descriptionKey: "item.ticketLifecycle.description",
            relativePath:
              "03-domain/service-desk/ticket/ticket-lifecycle.md",
          },
          {
            id: "ticket-action",
            titleKey: "item.ticketAction.title",
            descriptionKey: "item.ticketAction.description",
            relativePath: "03-domain/service-desk/ticket/ticket-action.md",
          },
          {
            id: "ticket-history",
            titleKey: "item.ticketHistory.title",
            descriptionKey: "item.ticketHistory.description",
            relativePath: "03-domain/service-desk/ticket/ticket-history.md",
          },
          {
            id: "ticket-work-session",
            titleKey: "item.ticketWorkSession.title",
            descriptionKey: "item.ticketWorkSession.description",
            relativePath:
              "03-domain/service-desk/ticket/ticket-work-session.md",
          },
        ],
      },
      {
        id: "strategies",
        titleKey: "section.domain.strategies.title",
        items: [
          {
            id: "action-strategy",
            titleKey: "item.actionStrategy.title",
            descriptionKey: "item.actionStrategy.description",
            relativePath:
              "03-domain/service-desk/ticket/strategy/action-strategy.md",
          },
          {
            id: "category-strategy",
            titleKey: "item.categoryStrategy.title",
            descriptionKey: "item.categoryStrategy.description",
            relativePath:
              "03-domain/service-desk/ticket/strategy/category-strategy.md",
          },
          {
            id: "approval-system",
            titleKey: "item.approvalSystem.title",
            descriptionKey: "item.approvalSystem.description",
            relativePath:
              "03-domain/service-desk/ticket/strategy/approval-system.md",
          },
          {
            id: "assignment-policy",
            titleKey: "item.assignmentPolicy.title",
            descriptionKey: "item.assignmentPolicy.description",
            relativePath:
              "03-domain/service-desk/ticket/strategy/assignment-policy.md",
          },
          {
            id: "sla-strategy",
            titleKey: "item.slaStrategy.title",
            descriptionKey: "item.slaStrategy.description",
            relativePath:
              "03-domain/service-desk/ticket/strategy/sla-strategy.md",
          },
        ],
      },
      {
        id: "reference",
        titleKey: "section.domain.reference.title",
        items: [
          {
            id: "ticket-operation-rules",
            titleKey: "item.ticketOperationRules.title",
            descriptionKey: "item.ticketOperationRules.description",
            relativePath:
              "03-domain/service-desk/ticket/reference/ticket-operation-rules.md",
          },
        ],
      },
    ],
  },
  {
    id: "engineering",
    titleKey: "group.engineering.title",
    sections: [
      {
        id: "approach",
        titleKey: "section.engineering.approach.title",
        items: [
          {
            id: "development-approach",
            titleKey: "item.developmentApproach.title",
            descriptionKey: "item.developmentApproach.description",
            relativePath: "04-engineering/development-approach.md",
          },
          {
            id: "service-desk-implementation-strategy",
            titleKey: "item.serviceDeskImplementationStrategy.title",
            descriptionKey:
              "item.serviceDeskImplementationStrategy.description",
            relativePath:
              "04-engineering/service-desk-implementation-strategy.md",
          },
        ],
      },
      {
        id: "conventions",
        titleKey: "section.engineering.conventions.title",
        items: [
          {
            id: "boolean-naming-convention",
            titleKey: "item.booleanNamingConvention.title",
            descriptionKey: "item.booleanNamingConvention.description",
            relativePath:
              "04-engineering/conventions/boolean-naming-convention.md",
          },
        ],
      },
      {
        id: "documentation",
        titleKey: "section.engineering.documentation.title",
        items: [
          {
            id: "readme-strategy",
            titleKey: "item.readmeStrategy.title",
            descriptionKey: "item.readmeStrategy.description",
            relativePath: "04-engineering/documentation/readme-strategy.md",
          },
        ],
      },
      {
        id: "ui",
        titleKey: "section.engineering.ui.title",
        items: [
          {
            id: "component-boundary",
            titleKey: "item.componentBoundary.title",
            descriptionKey: "item.componentBoundary.description",
            relativePath: "04-engineering/ui/component-boundary.md",
          },
          {
            id: "dashboard-and-insight",
            titleKey: "item.dashboardAndInsight.title",
            descriptionKey: "item.dashboardAndInsight.description",
            relativePath: "04-engineering/ui/dashboard-and-insight.md",
          },
          {
            id: "dialog-pattern",
            titleKey: "item.dialogPattern.title",
            descriptionKey: "item.dialogPattern.description",
            relativePath: "04-engineering/ui/dialog-pattern.md",
          },
        ],
      },
      {
        id: "forms",
        titleKey: "section.engineering.forms.title",
        items: [
          {
            id: "form-pattern",
            titleKey: "item.formPattern.title",
            descriptionKey: "item.formPattern.description",
            relativePath: "04-engineering/forms/form-pattern.md",
          },
          {
            id: "ticket-form",
            titleKey: "item.ticketForm.title",
            descriptionKey: "item.ticketForm.description",
            relativePath: "04-engineering/forms/ticket-form.md",
          },
          {
            id: "ticket-attachment",
            titleKey: "item.ticketAttachment.title",
            descriptionKey: "item.ticketAttachment.description",
            relativePath: "04-engineering/forms/ticket-attachment.md",
          },
        ],
      },
      {
        id: "data-fetching",
        titleKey: "section.engineering.dataFetching.title",
        items: [
          {
            id: "react-query-strategy",
            titleKey: "item.reactQueryStrategy.title",
            descriptionKey: "item.reactQueryStrategy.description",
            relativePath:
              "04-engineering/data-fetching/react-query-strategy.md",
          },
        ],
      },
      {
        id: "i18n",
        titleKey: "section.engineering.i18n.title",
        items: [
          {
            id: "locale-structure",
            titleKey: "item.localeStructure.title",
            descriptionKey: "item.localeStructure.description",
            relativePath: "04-engineering/i18n/locale-structure.md",
          },
          {
            id: "validation-messages",
            titleKey: "item.validationMessages.title",
            descriptionKey: "item.validationMessages.description",
            relativePath: "04-engineering/i18n/validation-messages.md",
          },
        ],
      },
    ],
  },
  {
    id: "releases",
    titleKey: "group.releases.title",
    items: [
      {
        id: "release-overview",
        titleKey: "item.releaseOverview.title",
        descriptionKey: "item.releaseOverview.description",
        relativePath: "05-releases/README.md",
      },
    ],
  },
  {
    id: "decisions",
    titleKey: "group.decisions.title",
    sections: [
      {
        id: "overview",
        titleKey: "section.decisions.overview.title",
        items: [
          {
            id: "decision-overview",
            titleKey: "item.decisionOverview.title",
            descriptionKey: "item.decisionOverview.description",
            relativePath: "06-decisions/README.md",
          },
        ],
      },
      {
        id: "2025-12",
        titleKey: "section.decisions.2025-12.title",
        items: [
          {
            id: "decision-auth-session-architecture",
            titleKey: "item.decisionAuthSessionArchitecture.title",
            descriptionKey: "item.decisionAuthSessionArchitecture.description",
            relativePath:
              "06-decisions/2025-12-auth-session-architecture.md",
          },
          {
            id: "decision-impersonation-2025-12",
            titleKey: "item.decisionImpersonation202512.title",
            descriptionKey: "item.decisionImpersonation202512.description",
            relativePath: "06-decisions/2025-12-impersonation.md",
          },
          {
            id: "decision-naming-2025-12",
            titleKey: "item.decisionNaming202512.title",
            descriptionKey: "item.decisionNaming202512.description",
            relativePath: "06-decisions/2025-12-naming.md",
          },
          {
            id: "decision-system-layout",
            titleKey: "item.decisionSystemLayout.title",
            descriptionKey: "item.decisionSystemLayout.description",
            relativePath: "06-decisions/2025-12-system-layout.md",
          },
        ],
      },
      {
        id: "2026-01",
        titleKey: "section.decisions.2026-01.title",
        items: [
          {
            id: "decision-category-design",
            titleKey: "item.decisionCategoryDesign.title",
            descriptionKey: "item.decisionCategoryDesign.description",
            relativePath: "06-decisions/2026-01-category-design.md",
          },
          {
            id: "decision-impersonation-2026-01",
            titleKey: "item.decisionImpersonation202601.title",
            descriptionKey: "item.decisionImpersonation202601.description",
            relativePath: "06-decisions/2026-01-impersonation.md",
          },
          {
            id: "decision-session-user-boundary-2026-01",
            titleKey: "item.decisionSessionUserBoundary202601.title",
            descriptionKey: "item.decisionSessionUserBoundary202601.description",
            relativePath:
              "06-decisions/2026-01-session-user-boundary.md",
          },
        ],
      },
      {
        id: "2026-02",
        titleKey: "section.decisions.2026-02.title",
        items: [
          {
            id: "decision-service-desk-settings",
            titleKey: "item.decisionServiceDeskSettings.title",
            descriptionKey: "item.decisionServiceDeskSettings.description",
            relativePath:
              "06-decisions/2026-02-service-desk-settings.md",
          },
        ],
      },
      {
        id: "2026-03",
        titleKey: "section.decisions.2026-03.title",
        items: [
          {
            id: "decision-service-desk",
            titleKey: "item.decisionServiceDesk.title",
            descriptionKey: "item.decisionServiceDesk.description",
            relativePath: "06-decisions/2026-03-service-desk.md",
          },
          {
            id: "decision-ticket-form-dialog",
            titleKey: "item.decisionTicketFormDialog.title",
            descriptionKey: "item.decisionTicketFormDialog.description",
            relativePath: "06-decisions/2026-03-ticket-form-dialog.md",
          },
          {
            id: "decision-ticket-session-2026-03",
            titleKey: "item.decisionTicketSession202603.title",
            descriptionKey: "item.decisionTicketSession202603.description",
            relativePath: "06-decisions/2026-03-ticket-session.md",
          },
        ],
      },
      {
        id: "2026-04",
        titleKey: "section.decisions.2026-04.title",
        items: [
          {
            id: "decision-entity-status-naming",
            titleKey: "item.decisionEntityStatusNaming.title",
            descriptionKey: "item.decisionEntityStatusNaming.description",
            relativePath:
              "06-decisions/2026-04-entity-status-naming.md",
          },
          {
            id: "decision-ticket-action",
            titleKey: "item.decisionTicketAction.title",
            descriptionKey: "item.decisionTicketAction.description",
            relativePath: "06-decisions/2026-04-ticket-action.md",
          },
        ],
      },
      {
        id: "2026-05",
        titleKey: "section.decisions.2026-05.title",
        items: [
          {
            id: "decision-barrel-export-boundary-2026-05",
            titleKey: "item.decisionBarrelExportBoundary202605.title",
            descriptionKey: "item.decisionBarrelExportBoundary202605.description",
            relativePath:
              "06-decisions/2026-05-barrel-export-boundary.md",
          },
          {
            id: "decision-database-role-and-access-strategy-2026-05",
            titleKey: "item.decisionDatabaseRoleAndAccessStrategy202605.title",
            descriptionKey:
              "item.decisionDatabaseRoleAndAccessStrategy202605.description",
            relativePath:
              "06-decisions/2026-05-database-role-and-access-strategy.md",
          },
          {
            id: "decision-service-desk-documentation-alignment-2026-05",
            titleKey:
              "item.decisionServiceDeskDocumentationAlignment202605.title",
            descriptionKey:
              "item.decisionServiceDeskDocumentationAlignment202605.description",
            relativePath:
              "06-decisions/2026-05-service-desk-documentation-alignment.md",
          },
        ],
      },
      {
        id: "2026-06",
        titleKey: "section.decisions.2026-06.title",
        items: [
          {
            id: "decision-service-desk-tenant-design-2026-06",
            titleKey: "item.decisionServiceDeskTenantDesign202606.title",
            descriptionKey:
              "item.decisionServiceDeskTenantDesign202606.description",
            relativePath:
              "06-decisions/2026-06-service-desk-tenant-design.md",
          },
          {
            id: "decision-service-desk-settings-dto-api-boundary-2026-06",
            titleKey:
              "item.decisionServiceDeskSettingsDtoApiBoundary202606.title",
            descriptionKey:
              "item.decisionServiceDeskSettingsDtoApiBoundary202606.description",
            relativePath:
              "06-decisions/2026-06-service-desk-settings-dto-api-boundary.md",
          },
          {
            id: "decision-ticket-attachment-boundary-2026-06",
            titleKey: "item.decisionTicketAttachmentBoundary202606.title",
            descriptionKey:
              "item.decisionTicketAttachmentBoundary202606.description",
            relativePath:
              "06-decisions/2026-06-ticket-attachment-boundary.md",
          },
          {
            id: "decision-ticket-form-and-draft-workflow-2026-06",
            titleKey: "item.decisionTicketFormAndDraftWorkflow202606.title",
            descriptionKey:
              "item.decisionTicketFormAndDraftWorkflow202606.description",
            relativePath:
              "06-decisions/2026-06-ticket-form-and-draft-workflow.md",
          },
        ],
      },
      {
        id: "2026-07",
        titleKey: "section.decisions.2026-07.title",
        items: [
          {
            id: "decision-service-desk-settings-reference-validation-boundary-2026-07",
            titleKey:
              "item.decisionServiceDeskSettingsReferenceValidationBoundary202607.title",
            descriptionKey:
              "item.decisionServiceDeskSettingsReferenceValidationBoundary202607.description",
            relativePath:
              "06-decisions/2026-07-service-desk-settings-reference-validation-boundary.md",
          },
          {
            id: "decision-ticket-action-and-history-execution-2026-07",
            titleKey:
              "item.decisionTicketActionAndHistoryExecution202607.title",
            descriptionKey:
              "item.decisionTicketActionAndHistoryExecution202607.description",
            relativePath:
              "06-decisions/2026-07-ticket-action-and-history-execution.md",
          },
          {
            id: "decision-ticket-routing-and-update-policy-2026-07",
            titleKey: "item.decisionTicketRoutingAndUpdatePolicy202607.title",
            descriptionKey:
              "item.decisionTicketRoutingAndUpdatePolicy202607.description",
            relativePath:
              "06-decisions/2026-07-ticket-routing-and-update-policy.md",
          },
        ],
      },
    ],
  },
];
