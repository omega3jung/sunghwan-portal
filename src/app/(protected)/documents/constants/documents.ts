import type { DocumentGroup } from "../types/documents";

// Document metadata lives in one curated constant so the route, loader, and UI
// all share the same source of truth for the docs hub structure.
export const DEFAULT_DOCUMENT_ID = "readme";

export const documentGroups: DocumentGroup[] = [
  {
    id: "project",
    title: "Project",
    items: [
      {
        id: "readme",
        title: "README",
        description: "Landing document for the Service Desk documentation set.",
        relativePath: "README.md",
      },
      {
        id: "readme-strategy",
        title: "README Strategy",
        description:
          "How the repository introduces itself and routes readers into deeper docs.",
        relativePath: "01-project/readme-strategy.md",
      },
    ],
  },
  {
    id: "architecture",
    title: "Architecture",
    items: [
      {
        id: "feature-based-structure",
        title: "Feature-Based Structure",
        description: "Project slice boundaries and folder ownership strategy.",
        relativePath: "02-architecture/feature-based-structure.md",
      },
      {
        id: "routing-strategy",
        title: "Routing Strategy",
        description: "Route design and App Router boundaries.",
        relativePath: "02-architecture/routing-strategy.md",
      },
      {
        id: "state-management",
        title: "State Management",
        description:
          "Client state responsibilities and persistence boundaries.",
        relativePath: "02-architecture/state-management.md",
      },
      {
        id: "auth-session-strategy",
        title: "Auth & Session Strategy",
        description: "Authentication, session, and protected route design.",
        relativePath: "02-architecture/auth-session-strategy.md",
      },
      {
        id: "impersonation-strategy",
        title: "Impersonation Strategy",
        description: "Admin impersonation flow and related system boundaries.",
        relativePath: "02-architecture/impersonation-strategy.md",
      },
    ],
  },
  {
    id: "domain",
    title: "Domain",
    items: [
      {
        id: "ticket-system-overview",
        title: "Ticket System Overview",
        description: "High-level Service Desk domain overview.",
        relativePath: "03-domain/ticket/ticket-system-overview.md",
      },
      {
        id: "ticket-lifecycle",
        title: "Ticket Lifecycle",
        description: "Lifecycle states and transition design.",
        relativePath: "03-domain/ticket/ticket-lifecycle.md",
      },
      {
        id: "ticket-model",
        title: "Ticket Model",
        description: "Core ticket model and ownership structure.",
        relativePath: "03-domain/ticket/ticket-model.md",
      },
      {
        id: "ticket-activity",
        title: "Ticket Activity",
        description: "Activity model for communication and operational actions.",
        relativePath: "03-domain/ticket/ticket-activity.md",
      },
      {
        id: "ticket-history",
        title: "Ticket History",
        description: "Auditability and history timeline strategy.",
        relativePath: "03-domain/ticket/ticket-history.md",
      },
      {
        id: "action-strategy",
        title: "Action Strategy",
        description: "Action-oriented interaction and metadata design strategy.",
        relativePath: "03-domain/ticket/strategy/action-strategy.md",
      },
      {
        id: "category-strategy",
        title: "Category Strategy",
        description: "Category-driven workflow behavior across the system.",
        relativePath: "03-domain/ticket/strategy/category-strategy.md",
      },
      {
        id: "approval-system",
        title: "Approval System",
        description: "Approval steps and conditional workflow design.",
        relativePath: "03-domain/ticket/strategy/approval-system.md",
      },
      {
        id: "assignment-policy",
        title: "Assignment Policy",
        description: "Assignment logic and workload direction.",
        relativePath: "03-domain/ticket/strategy/assignment-policy.md",
      },
      {
        id: "sla-strategy",
        title: "SLA Strategy",
        description: "SLA handling and operational timing rules.",
        relativePath: "03-domain/ticket/strategy/sla-strategy.md",
      },
    ],
  },
  {
    id: "ui-ux",
    title: "UI/UX",
    items: [
      {
        id: "component-boundary",
        title: "Component Boundary",
        description:
          "UI responsibility split across layout and feature layers.",
        relativePath: "04-ui-ux/component-boundary.md",
      },
      {
        id: "dialog-pattern",
        title: "Dialog Pattern",
        description: "Dialog usage and interaction pattern guidance.",
        relativePath: "04-ui-ux/dialog-pattern.md",
      },
      {
        id: "form-pattern",
        title: "Form Pattern",
        description: "Form interaction and responsibility design.",
        relativePath: "04-ui-ux/form-pattern.md",
      },
      {
        id: "dashboard-and-insight",
        title: "Dashboard and Insight",
        description:
          "How operational surfaces differ from analytical insight views.",
        relativePath: "04-ui-ux/dashboard-and-insight.md",
      },
    ],
  },
  {
    id: "data-fetching",
    title: "Data Fetching",
    items: [
      {
        id: "react-query-strategy",
        title: "React Query Strategy",
        description: "Data fetching, caching, and client boundary guidance.",
        relativePath: "05-data-fetching/react-query-strategy.md",
      },
    ],
  },
  {
    id: "form-design",
    title: "Form Design",
    items: [
      {
        id: "ticket-form",
        title: "Ticket Form",
        description:
          "Form flow, category-driven behavior, and submission design.",
        relativePath: "06-form-design/ticket-form.md",
      },
    ],
  },
  {
    id: "i18n",
    title: "i18n",
    items: [
      {
        id: "locale-structure",
        title: "Locale Structure",
        description:
          "Namespace structure and translation responsibility boundaries.",
        relativePath: "07-i18n/locale-structure.md",
      },
      {
        id: "validation-messages",
        title: "Validation Messages",
        description: "Validation wording strategy and translation separation.",
        relativePath: "07-i18n/validation-messages.md",
      },
    ],
  },
  {
    id: "dev-strategy",
    title: "Dev Strategy",
    items: [
      {
        id: "development-approach",
        title: "Development Approach",
        description:
          "Practical implementation philosophy and migration-aware decisions.",
        relativePath: "08-dev-strategy/development-approach.md",
      },
      {
        id: "service-desk-evolution",
        title: "Service Desk Evolution",
        description:
          "How Service Hub experience evolved into the Service Desk domain.",
        relativePath: "08-dev-strategy/service-desk-evolution.md",
      },
      {
        id: "service-desk-implementation-strategy",
        title: "Service Desk Implementation Strategy",
        description:
          "Runtime, architecture, and implementation strategy for Service Desk.",
        relativePath:
          "08-dev-strategy/service-desk-implementation-strategy.md",
      },
      {
        id: "ticket-operation-rules",
        title: "Ticket Operation Rules",
        description:
          "Implementation-facing ticket operation rules and execution constraints.",
        relativePath: "08-dev-strategy/ticket-operation-rules.md",
      },
    ],
  },
  {
    id: "decision-log",
    title: "Decision Log",
    items: [
      {
        id: "decision-auth-session-architecture",
        title: "2025-12 Auth Session Architecture",
        description: "Session architecture decision log entry.",
        relativePath:
          "08-dev-strategy/decision-log/2025-12-auth-session-architecture.md",
      },
      {
        id: "decision-impersonation-2025-12",
        title: "2025-12 Impersonation",
        description: "Impersonation strategy decision log entry.",
        relativePath: "08-dev-strategy/decision-log/2025-12-impersonation.md",
      },
      {
        id: "decision-naming-2025-12",
        title: "2025-12 Naming",
        description: "Naming decision log entry.",
        relativePath: "08-dev-strategy/decision-log/2025-12-naming.md",
      },
      {
        id: "decision-system-layout",
        title: "2025-12 System Layout",
        description: "System layout decision log entry.",
        relativePath: "08-dev-strategy/decision-log/2025-12-system-layout.md",
      },
      {
        id: "decision-category-design",
        title: "2026-01 Category Design",
        description: "Category design decision log entry.",
        relativePath: "08-dev-strategy/decision-log/2026-01-category-design.md",
      },
      {
        id: "decision-impersonation-2026-01",
        title: "2026-01 Impersonation",
        description: "Impersonation decision log entry.",
        relativePath: "08-dev-strategy/decision-log/2026-01-impersonation.md",
      },
      {
        id: "decision-session-user-boundary-2026-01",
        title: "2026-01 Session User Boundary",
        description: "Session user boundary decision log entry.",
        relativePath:
          "08-dev-strategy/decision-log/2026-01-session-user-boundary.md",
      },
      {
        id: "decision-service-desk-settings",
        title: "2026-02 Service Desk Settings",
        description: "Service Desk settings design log entry.",
        relativePath:
          "08-dev-strategy/decision-log/2026-02-service-desk-settings.md",
      },
      {
        id: "decision-service-desk",
        title: "2026-03 Service Desk",
        description: "Service Desk implementation decision log entry.",
        relativePath: "08-dev-strategy/decision-log/2026-03-service-desk.md",
      },
      {
        id: "decision-ticket-form-dialog",
        title: "2026-03 Ticket Form Dialog",
        description: "Ticket form dialog decision log entry.",
        relativePath:
          "08-dev-strategy/decision-log/2026-03-ticket-form-dialog.md",
      },
      {
        id: "decision-ticket-session-2026-03",
        title: "2026-03 Ticket Session",
        description: "Ticket session behavior decision log entry.",
        relativePath: "08-dev-strategy/decision-log/2026-03-ticket-session.md",
      },
      {
        id: "decision-entity-status-naming",
        title: "2026-04 Entity Status Naming",
        description: "Entity naming decision log entry.",
        relativePath:
          "08-dev-strategy/decision-log/2026-04-entity-status-naming.md",
      },
      {
        id: "decision-ticket-action",
        title: "2026-04 Ticket Action Model Introduction",
        description: "Ticket action model introduction decision log entry.",
        relativePath: "08-dev-strategy/decision-log/2026-04-ticket-action.md",
      },
      {
        id: "decision-barrel-export-boundary-2026-05",
        title: "2026-05 Barrel Export Boundary",
        description: "Barrel export boundary decision log entry.",
        relativePath:
          "08-dev-strategy/decision-log/2026-05-barrel-export-boundary.md",
      },
    ],
  },
];
