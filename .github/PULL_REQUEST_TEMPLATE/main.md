## PR Title Convention (Required)

Please use the following format:
`<type>(<scope>): <description>`

Examples:

- feat(portal): establish authentication, layout, and permission-driven portal foundation
- fix(auth): resolve session mismatch on logout

## Overview

Briefly describe what this PR delivers to `main`.
Focus on the overall impact rather than implementation details.

---

## What’s Included

List major changes grouped by concern.

### Authentication / Authorization

-

### Layout / Routing

-

### Data / API

-

### UI / i18n

-

## Why This Merge

Explain why this change should be merged into `main`.
Consider stability, readiness, and long-term impact.

---

## Scope

- [ ] Authentication & Session Management
- [ ] Authorization & Permission Model
- [ ] Layout Architecture (Public / Protected)
- [ ] User Preferences (Theme, Language)
- [ ] Internationalization (i18n)
- [ ] Navigation / Routing
- [ ] Tooling / Middleware / Project Standards

---

## Deployment Checklist (Required for main)

- [ ] No breaking changes without migration or fallback
- [ ] Environment variables reviewed (if applicable)
- [ ] Auth / permission changes verified
- [ ] i18n / hydration behavior checked
- [ ] This PR is safe to deploy
