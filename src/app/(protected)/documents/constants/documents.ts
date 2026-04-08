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
        id: "ticket-system-design",
        title: "Ticket System Design",
        description: "High-level Service Desk domain overview.",
        relativePath: "03-domain/ticket-system-design.md",
      },
      {
        id: "category-strategy",
        title: "Category Strategy",
        description: "Category-driven workflow behavior across the system.",
        relativePath: "03-domain/category-strategy.md",
      },
      {
        id: "approval-system",
        title: "Approval System",
        description: "Approval steps and conditional workflow design.",
        relativePath: "03-domain/approval-system.md",
      },
      {
        id: "assignment-policy",
        title: "Assignment Policy",
        description: "Assignment logic and workload direction.",
        relativePath: "03-domain/assignment-policy.md",
      },
      {
        id: "sla-strategy",
        title: "SLA Strategy",
        description: "SLA handling and operational timing rules.",
        relativePath: "03-domain/sla-strategy.md",
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
        id: "decision-service-desk-settings",
        title: "2026-02 Service Desk Settings",
        description: "Service Desk settings design log entry.",
        relativePath:
          "08-dev-strategy/decision-log/2026-02-service-desk-settings.md",
      },
    ],
  },
];
