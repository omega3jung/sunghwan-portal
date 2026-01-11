# Useage of Preference, Setup, Settings and Configuration

## Preference

Define

- User preferences / Personalization options
- No impact on other users or system behavior
- Changes can be made at any time without impacting system stability

Example

- Theme (Light / Dark)
- Language
- Notification on/off
- Default workspace
- Table density / column visibility

Rule

- If this value changes, will it affect anyone but me?
- If no, Preference

---

## Setup

Define

- Data that must be prepared in advance for the system to function.
- Without this data, functions will not function or creation will be impossible.
- Usually done during the initial deployment/onboarding phase.
- Typically low-frequency changes after initial setup

Example

- Carrier
- Project
- Maker
- Model
- Label

Rule

- Master Data
- Reference Data
- Foundational Data

---

## Settings

Define

- Adjusting the behavior of the application/system
- Includes data, policies, and organizational structure
- There's a strong sense of "managed by the operator"

Example

- Account Settings
- Workflow Settings
- IT Service Desk Settings

Rule

- How will the system behave if I change this?
- Will the organization or work processes change?
- If yes, Settings

---

## Configuration

Define

- Rules, conditions, and mappings that directly alter system logic
- Hide from general users
- Could cause errors if left unchecked

Example

- State Transition Conditions
- SLA Time Calculation Method
- Priority Calculation Logic
- Automatic Assignment Conditions
- Feature Flags
- External System Integration Options

Rule

- Conditional/Rule-based
- Developer or Advanced Administrator Area
- A wrong setup can lead to serious problems.
