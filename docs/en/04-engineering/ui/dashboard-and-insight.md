# Dashboard and Insight Design

## Goal

The dashboard and insight pages are designed to provide **role-aware, context-driven information visibility**
for a Service Desk system used by both requesters and assignees.

It aims to:

- Deliver quick operational visibility through the dashboard
- Provide deeper analytical insights through a dedicated insight page
- Adapt information density based on user roles
- Enable flexible, query-driven data visualization

---

## Core Principle

```id="dashboard-principle"
Information should be layered by purpose: quick overview vs deep analysis
```

---

## Problem Statement

The Service Desk system is used by two primary roles:

- **Requester** submits and tracks tickets
- **Assignee (Agent)** manages and resolves tickets

---

### Challenge

A single dashboard must serve both roles, but their needs are different.

- Requesters need **simple, focused information**
- Assignees need **detailed operational insights**

---

### Initial Consideration

Introducing KPI cards such as total tickets, SLA compliance, and status distribution directly on the dashboard.

---

### Issue

KPI cards introduce:

- High information density
- Analytical context not needed by requesters
- Potential cognitive overload

---

## Key Decision

```txt id="dashboard-decision"
Separate Dashboard (overview) and Insight (analysis)
```

---

## Page Responsibilities

### Dashboard

- Entry point for daily work
- Quick visibility of current ticket state
- Lightweight and easy to scan

---

### Insight

- Dedicated analysis page
- Query-based filtering and aggregation
- Supports deeper interpretation of ticket data

---

## Role Strategy

### Requester Experience

The dashboard should prioritize clarity and simplicity.

---

### Characteristics

- Minimal information density
- Personal and relevant data only
- Fast recognition of what needs attention

---

### Typical Content

- My open tickets
- Recent requests
- Pending approvals
- Request status summary

---

### Assignee Experience

The insight page should support operational analysis and monitoring.

---

### Characteristics

- Higher information density
- Trend and distribution analysis
- Cross-team and category-level visibility

---

### Typical Content

- Tickets by status
- Tickets by category
- SLA-related metrics
- Resolution trends
- Workload distribution

---

## Information Layering

### Rule

```id="layering-rule"
Do not mix overview widgets with analytical reporting in the same primary surface
```

---

### Rationale

- Keeps the dashboard lightweight
- Reduces noise for requesters
- Gives analytics a dedicated space with proper context

---

## Dashboard Design Pattern

### Structure

```txt id="dashboard-structure"
Header
Quick summary
Personal work widgets
Recent activity
```

---

### Characteristics

- Designed for quick scanning
- Favors concise summaries over charts
- Focuses on immediate action and awareness

---

## Insight Design Pattern

### Structure

```txt id="insight-structure"
Header
Filter controls
Analytical cards
Charts and breakdowns
Supporting tables
```

---

### Characteristics

- Supports exploration and comparison
- Allows filtering by time, status, category, or assignee
- Optimized for interpretation rather than speed alone

---

## KPI Strategy

### Decision

- KPI cards belong primarily in the insight page
- Only lightweight operational summaries should appear on the dashboard

---

### Reason

- KPIs require interpretation context
- They are more useful for assignees and managers than requesters
- They increase density when placed on the main dashboard

---

## Query-Driven Insight

Insight content should react to filters and search conditions.

---

### Example Filters

- Date range
- Ticket category
- Status
- Priority
- Assignee

---

### Benefit

- Enables analysis by context
- Makes metrics more trustworthy
- Supports investigation instead of static reporting

---

## Visualization Strategy

### Dashboard

- Prefer short summaries and compact lists
- Avoid overusing charts

---

### Insight

- Use charts when they support comparison or trends
- Pair visuals with filters and clear labels

---

## UX Considerations

### 1. Role-Aware Density

- Match information depth to user responsibility

---

### 2. Immediate Readability

- Dashboard content should be understandable at a glance

---

### 3. Analytical Context

- Insight metrics should be shown with filtering and labeling context

---

### 4. Clear Navigation

- Moving from dashboard to insight should feel intentional and natural

---

## Anti-Patterns Avoided

### 1. One Dashboard for Every Need

- Hard to optimize for different roles

---

### 2. KPI Overload on the Main Dashboard

- Reduces readability
- Increases cognitive load

---

### 3. Analytics Without Filters

- Weakens interpretation
- Limits usefulness

---

### 4. Mixing Personal and Operational Context

- Blurs purpose
- Makes prioritization harder

---

## Trade-offs

### Pros

- Clear separation of overview and analysis
- Better role alignment
- Improved readability and focus
- More scalable dashboard architecture

---

### Cons

- Requires maintaining two related surfaces
- Adds navigation between overview and analysis
- Needs discipline to avoid feature overlap

---

## Alternatives Considered

### 1. Single Unified Dashboard

- Simple entry point
- Too dense for mixed audiences

---

### 2. Dashboard with Embedded Analytics Section

- Convenient access to KPIs
- Risks clutter and role confusion

---

### 3. Analytics Only, No Lightweight Dashboard

- Strong reporting focus
- Weak support for quick daily awareness

---

## Design Principles Alignment

This structure aligns with:

- Separation of concerns
- Role-aware UX
- Progressive disclosure
- Scalable information architecture

---

## Summary

The dashboard and insight strategy separates **overview-oriented visibility** from
**analysis-oriented reporting**, allowing requesters to stay focused on immediate needs
while giving assignees a dedicated space for deeper operational understanding.
