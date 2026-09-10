# Storybook Coverage 전략 (2026-09)

## 배경

2026년 9월 프로젝트는 위험 기반 Vitest coverage를 정리한 뒤, reusable UI component의
visual state와 browser interaction을 어떤 경계에서 검증할지 별도로 결정할 필요가
있었습니다.

Vitest는 다음 영역을 중심으로 application correctness를 보호합니다.

```txt
domain rule
-> authorization
-> Route Handler
-> server workflow
-> feature orchestration
-> page/view-model composition
```

반면 프로젝트가 직접 소유한 reusable UI는 다음 특성을 독립적인 browser 환경에서
검토할 가치가 있습니다.

- 여러 visual state
- configurable public prop
- controlled value
- browser interaction
- caller-provided composition
- theme 및 locale에 따른 표현

초기 프로젝트는 `src/components/custom`을 확인하기 위해
`src/app/(protected)/demo` 아래에 component playground page를 운영했습니다.

```txt
application route
-> demo page
-> custom component
-> demo-specific control UI
```

Storybook coverage가 확장되면서 application route와 Storybook이 같은 component
inspection 책임을 중복해서 가지게 되었습니다. 따라서 전체 Storybook coverage 범위와
기존 `/demo` playground를 대체하는 기준을 함께 정리했습니다.

---

## 문제

### 1. Story가 존재하는 것만으로 Demo Playground를 대체할 수 없음

Storybook Controls가 존재해도 `args`가 실제 component에 전달되지 않으면 public
parameter를 변경하며 동작을 확인할 수 없습니다. Controlled component가
`useState(args.value)`의 initial value만 사용하면 이후 Controls 변경과 Canvas
interaction도 서로 다른 state를 가질 수 있습니다.

```txt
Story exists
!=
Storybook can inspect the public component contract
```

대체 여부는 다음을 함께 확인해야 합니다.

```txt
representative Story
+ configurable public Controls
+ args connected to rendering
+ meaningful browser interaction
+ observable controlled result
```

### 2. Demo는 Visual State 외에도 Parameter Exploration을 제공했음

기존 demo page는 다음과 같은 public parameter를 직접 변경할 수 있었습니다.

```txt
AvatarMultiComboBox -> maxImages
DatePicker family   -> minDate / maxDate / minuteStep / compact / range options
FileAttachment      -> maxCount / maxSizeMB / accept / limitBehavior
SortableTree        -> reorderScope / indentation / collapsible
Stepper             -> orientation / visual composition
```

의미적으로 다른 상태와 연속적인 parameter variation을 구분하지 않으면 유사한 Story가
불필요하게 증가합니다.

```txt
meaningfully different state
-> Story

continuous public parameter variation
-> Controls
```

### 3. 같은 Component Family라도 Public Contract가 다를 수 있음

다음 component들은 같은 family에 있지만 각각 다른 public API를 가집니다.

```txt
AvatarComboBox / AvatarMultiComboBox
DatePicker / DateTimePicker / DateRangePicker / SearchDateFilter
HierarchicalSelect / MultiHierarchicalSelect
MultiComboBox / TreeMultiComboBox
```

한 Meta에서 다른 public component를 custom render로만 표현하면 component 고유 prop이
Controls에 자연스럽게 노출되지 않을 수 있습니다. Storybook hierarchy는 source folder
grouping보다 public component contract를 반영해야 합니다.

### 4. 전체 Storybook 범위와 `/demo` 대체 범위는 같지 않음

기존 `/demo` route의 책임은 `src/components/custom` playground였습니다. 그러나 전체
Storybook은 처음부터 다음 세 영역의 application-owned reusable UI를 핵심 범위로
검토했습니다.

```txt
src/components/custom
src/components/layout
src/components/menu
```

또한 application workflow를 재현하지 않고 독립적으로 렌더링할 수 있는 feature
presentation component를 소수만 예외적으로 허용했습니다.

따라서 다음 두 경계를 구분합니다.

```txt
/demo replacement boundary
-> src/components/custom

overall Storybook boundary
-> custom
-> selected layout/menu
-> selected independent feature presentation
```

### 5. Component Variant와 Caller Composition을 구분해야 함

예를 들어 `Step 1: Request`와 같은 Stepper 표현은 Stepper 자체의 variant가 아니라
caller가 전달하는 label composition입니다. Storybook 편의를 위해 production component
API에 존재하지 않는 variant를 추가하면 Story가 실제 public contract와 달라집니다.

### 6. Storybook 전용 Contract는 Production과 Drift할 수 있음

Production option constant나 type이 이미 존재한다면 Storybook은 이를 재사용해야 합니다.
같은 option을 Story에 다시 hard-code하거나 Storybook 전용 production prop을 추가하면 두
contract가 독립적으로 변경될 수 있습니다.

---

## 결정 동인

1. 프로젝트가 직접 소유한 reusable UI contract를 독립적으로 검토할 수 있어야 함
2. Demo에서 가능했던 parameter exploration과 interaction을 잃지 않아야 함
3. Story와 Controls가 production public API를 그대로 반영해야 함
4. representative state와 continuous parameter variation을 구분해야 함
5. controlled component의 Controls와 Canvas state가 일관되어야 함
6. Storybook을 application workflow 또는 domain test의 대체재로 확장하지 않아야 함
7. shadcn/Base UI 자체를 다시 문서화하지 않아야 함
8. application 내부 component playground의 중복 유지보수를 제거해야 함
9. 전체 Storybook 범위와 `/demo` 대체 범위를 혼동하지 않아야 함

---

## 검토한 선택지

### 선택지 1. 기존 `/demo`와 Storybook을 모두 유지

두 환경에서 application context와 isolated context를 모두 확인할 수 있지만 동일한
custom component, fixture 및 control UI를 중복 관리해야 합니다. 두 환경의 variant와
fixture가 drift할 위험도 있습니다.

Storybook이 동일하거나 더 나은 inspection capability를 제공할 수 있으므로 장기 구조로는
채택하지 않았습니다.

### 선택지 2. 대응 Story 존재 여부만 확인하고 `/demo`를 제거

빠르게 중복 route를 제거할 수 있지만 Demo의 configurable parameter, args connection,
controlled interaction 및 result가 누락될 수 있습니다.

Story 존재 여부만으로는 replacement 기준이 부족하므로 채택하지 않았습니다.

### 선택지 3. 모든 UI와 Feature Component를 Storybook 대상으로 지정

Story 수는 빠르게 증가하지만 shadcn/Base UI를 중복 문서화하고, React Query/API/workflow
mocking과 application provider tree를 Storybook에 복제할 가능성이 큽니다.

현재 프로젝트 목적에 비해 과도하므로 채택하지 않았습니다.

### 선택지 4. Application-owned Reusable UI를 명시적 경계로 사용

다음 경계를 채택했습니다.

```txt
src/components/custom
-> comprehensive reusable component coverage

src/components/layout
src/components/menu
-> selected application-wide visual UI

independent feature presentation
-> small, explicit exceptions

domain / workflow / authorization
-> Vitest

full application workflow
-> Live Demo

future cross-page browser journey
-> E2E / Playwright
```

이 구조는 `/demo` playground를 대체하면서도 Storybook을 또 하나의 application으로
확장하지 않습니다.

---

## 결정

### 1. `src/components/custom`은 포괄적인 Storybook Coverage 대상임

프로젝트가 직접 만든 reusable custom component의 public family는 가능한 한 모두
Storybook에서 검토합니다. 내부 implementation 파일마다 Story를 만들지는 않습니다.

```txt
public component contract
-> Storybook Meta

internal implementation detail
-> covered through the public component
```

### 2. Layout과 Menu는 선별적으로 포함함

`src/components/layout`과 `src/components/menu`에서는 application-wide visual state를
독립적으로 확인할 가치가 있고 과도한 runtime 재현이 필요하지 않은 component만
선별합니다.

현재 구현된 대상은 다음과 같습니다.

```txt
Layout/RouteLoading
Menu/PreferencesMenu
Menu/UserMenu
```

### 3. Feature Story는 독립적인 Presentation Component로 제한함

Feature workflow/container 전체는 Storybook으로 옮기지 않습니다. Domain type을
재사용하면서 API 또는 workflow infrastructure 없이 렌더링할 수 있는 presentation
component만 소수 허용합니다.

현재 구현된 예외는 다음과 같습니다.

```txt
ServiceDesk/TicketStatusBadge
ServiceDesk/TicketHistoryTimeline
```

### 4. Repository-wide Coverage 목표를 사용하지 않음

다음 목표는 사용하지 않습니다.

```txt
Every React component needs a Story
Every UI file needs Storybook coverage
```

Story 또는 Story file 수는 품질 지표가 아닙니다. Public contract를 독립적으로 검토할
수 있는지가 coverage 판단 기준입니다.

### 5. 의미적으로 다른 상태는 Story로 표현함

`Default`, `WithValue`, `Empty`, `Disabled`, `ReadOnly`, `Loading`, `Multiple`처럼 사용자가
구분해서 확인할 가치가 있는 상태는 별도 Story로 표현할 수 있습니다.

값만 연속적으로 달라지는 parameter는 near-duplicate Story로 늘리지 않습니다.

### 6. Continuous Public Parameter는 Controls로 제공함

다음과 같은 configurable value는 기본적으로 Storybook Controls가 소유합니다.

```txt
maxImages
minDate / maxDate
minuteStep
maxCount / maxSizeMB
orientation
indentation
collapsible
```

Demo 전용 `<Input>`, `<Select>`, `<Switch>`는 Controls가 같은 역할을 제공하면 복제하지
않습니다.

### 7. Controls와 Canvas는 같은 Controlled State를 사용함

```txt
Controls change
-> args
-> rendered component

Canvas interaction
-> callback
-> args/state update
-> observable result
```

필요한 경우 `useArgs` 또는 동등한 Storybook-controlled pattern을 사용합니다. Initial
args만 local state로 복사해 이후 Control 변경을 무시하는 구조는 허용하지 않습니다.

### 8. Meta는 Public Component Contract를 기준으로 분리함

같은 source family에 있어도 public API가 실질적으로 다르면 독립 Meta를 사용합니다.
현재 Avatar, DatePicker, HierarchicalSelect, MultiComboBox family는 public component별로
분리되어 있습니다.

### 9. Production Contract를 다시 정의하지 않음

Storybook은 production type, option constant, public enum/value definition을 재사용합니다.
예를 들어 DateRangePicker의 preset Control은 production의
`DEFAULT_DATE_RANGE_PRESETS`를 사용합니다.

Storybook을 편하게 만들기 위한 production prop은 추가하지 않습니다.

### 10. Caller Composition을 Component Variant와 구분함

Stepper의 numbered label은 caller-provided content를 보여주는 composition Story로
표현합니다. Stepper에 `showStepNumber` 또는 `showStepPrefix` 같은 책임을 추가하지
않습니다.

### 11. Browser Interaction은 Inspection 가치에 따라 검증함

Storybook Canvas에서는 public API가 지원하는 다음 interaction을 확인할 수 있어야 합니다.

- select, remove 및 clear
- date/range 선택
- text/editor input
- attachment add/remove
- tree expand/collapse 및 지원되는 reordering
- step navigation

수동 Canvas interaction으로 충분할 수 있습니다. 안정적이고 regression 가치가 큰 경우에만
`play`를 추가합니다. 현재 ColorPicker, FileAttachment, RichEditor, SortableTree,
Stepper Story에 `play` interaction이 있습니다.

### 12. Full Application Workflow는 Storybook으로 이동하지 않음

다음과 같은 전체 workflow는 Vitest와 Live Demo가 각자의 책임 경계에서 검토합니다.

```txt
login
-> impersonation
-> ticket creation
-> approval
-> assignment
-> action
-> history
-> work session
```

향후 cross-page real-browser regression이 필요하면 Playwright E2E 경계에서 검토합니다.
Storybook에 application provider/API architecture 전체를 복제하지 않습니다.

### 13. 기존 `/demo` Playground를 Storybook으로 대체함

`src/app/(protected)/demo`가 제공하던 custom component playground 책임은 Storybook의
Story, Controls, args connection, interaction 및 observable result로 이전했습니다.

해당 route에는 Storybook으로 이전하기 어려운 application workflow 책임이 없었으므로
현재는 삭제되었습니다.

```txt
previous
-> src/app/(protected)/demo

current
-> src/components/custom
-> src/stories
-> Storybook
```

이는 로그인 화면의 `Try Demo`, LOCAL runtime, mutable demo state 또는 Service Desk Live
Demo를 제거한 것이 아닙니다. 제거한 것은 custom component를 확인하던 application 내부
playground route입니다.

### 14. Storybook을 `/storybook` Route로 제공함

개발 환경에서는 애플리케이션의 protected `/storybook` route가 6006 포트의 Storybook을
iframe으로 표시합니다. `npm run dev:all`은 Next.js와 `npm run storybook:no`
(`storybook dev -p 6006 --no-open`)를 함께 실행합니다.

Production build에서는 Storybook static output을 `public/storybook-static`에 포함하고
같은 protected route에서 제공합니다.

```txt
development
/storybook -> http://localhost:6006

production
/storybook -> ${basePath}/storybook-static/index.html
```

### 15. Theme, Locale 및 Runtime Provider를 공통으로 제공함

Storybook preview는 application CSS와 다음 공통 환경을 제공합니다.

- light/dark theme toolbar
- `en`, `ko`, `fr`, `es` locale toolbar
- application i18next runtime
- React Query provider with disabled queries
- empty NextAuth session provider

Story가 실제 network request를 만들지 않도록 global query와 Story별 fixture를 구성합니다.

### 16. Storybook Browser Project는 기본 Unit Test와 분리함

Vitest에는 `@storybook/addon-vitest`와 headless Playwright Chromium을 사용하는
`storybook` browser project가 구성되어 있습니다. `play` interaction이나 browser 전용
동작이 변경되면 다음처럼 명시적으로 실행할 수 있습니다.

```bash
npm exec vitest -- run --project storybook
```

기본 `npm test`는 `unit` project만 실행합니다. Storybook browser project는 현재 CI에서
모든 test가 통과하는 강제 gate가 아닙니다.

---

## 현재 구현 결과

결정 구현 시점의 Storybook surface는 다음과 같습니다.

| 범위 | Story file 수 | 역할 |
| --- | ---: | --- |
| `src/components/custom` | 17 | Public reusable component family의 포괄적 coverage |
| `src/components/layout` | 1 | Route loading visual state |
| `src/components/menu` | 2 | Application-wide preference 및 identity menu |
| Selected feature presentation | 2 | Ticket status 및 history presentation |
| 합계 | 22 | 94개 Story entry |

구현 결과는 다음을 만족합니다.

- Custom component마다 public API에 맞는 Meta와 representative state를 제공함
- Controlled Story가 args와 `useArgs`로 연결되며, 남아 있는 browser runner failure는
  verification gap으로 추적함
- Production option/type을 재사용함
- Theme과 네 개 locale을 전역에서 전환할 수 있음
- Stable interaction에 선택적 `play` coverage를 제공함
- `/demo` component playground를 제거함
- protected `/storybook` route에서 개발 및 production Storybook을 제공함
- Storybook static build를 application production build에 통합함

현재 Storybook browser project는 94개 Story test 중 90개가 통과합니다. 다음 네 개의
`play` scenario는 Vitest browser runner에서 아직 실패합니다.

```txt
ColorPicker / Default
RichEditor / Empty
SortableTree / Collapse Interaction
Stepper / Default
```

따라서 browser project는 필수 CI gate가 아니라 diagnostic check로 사용합니다. 이 상태는
채택한 coverage boundary를 바꾸지 않지만, 해당 failure를 해결하기 전에는 자동 interaction
coverage가 모두 통과한다고 설명하지 않습니다.

---

## 비용과 제약

- Storybook Meta와 Controls를 public API 변화와 함께 유지해야 함
- Controlled Story는 단순 static Story보다 구현이 복잡할 수 있음
- Editor, file input, drag-and-drop은 browser timing과 interaction 특성을 고려해야 함
- 모든 parameter combination을 자동으로 검증하지는 않음
- Storybook build 및 browser tooling compatibility를 별도로 관리해야 함
- Storybook browser project는 구성되어 있지만 네 개 interaction scenario가 실패하며 아직
  기본 test/CI gate는 아님

---

## 적용 기준

| 대상 | 기본 검증 방식 |
| --- | --- |
| `src/components/custom` public reusable UI | Storybook comprehensive coverage |
| 선별된 `layout` / `menu` UI | Storybook |
| 독립적인 feature presentation component | 제한된 Storybook 예외 |
| 의미적으로 다른 visual/state variation | Story |
| configurable public prop | Controls |
| controlled public value | args / `useArgs` synchronization |
| caller-provided content composition | Composition Story |
| 중요한 안정적 browser interaction | Canvas + 선택적 `play` |
| shadcn/Base UI primitive | 기본적으로 Storybook 제외 |
| feature workflow/container | Vitest / Live Demo |
| domain/authorization/routing | Vitest |
| full cross-page browser workflow | 향후 E2E |

---

## 거부한 단순화

다음 규칙은 채택하지 않습니다.

```txt
Every component needs a Story
A Story exists, so the Demo is replaceable
Every prop combination should be a separate Story
Storybook Controls may duplicate production options
Caller-provided content should become a component variant
Every browser interaction needs a play test
Feature workflows should move into Storybook for completeness
Storybook should recreate the full application provider tree
```

---

## 재검토 조건

다음 조건이 생기면 Storybook coverage boundary를 다시 검토합니다.

- 현재 세 영역 밖에 독립적인 application-owned design-system component 영역이 생김
- feature component가 workflow dependency 없이 여러 surface에서 반복 사용됨
- visual regression이 실제 운영 결함의 주요 원인이 됨
- accessibility automation을 Storybook에서 공통 운영할 필요가 생김
- Storybook browser project가 안정적인 CI gate로 정착함
- custom component가 별도 package 또는 design system으로 추출됨

이 경우에도 repository 전체를 한 번에 확대하지 않고 public ownership과 regression
risk를 기준으로 범위를 다시 결정합니다.

---

## 관련 문서

- [테스트 전략](../05-development/testing-strategy.md)
- [Vitest Coverage 전략](./2026-09-vitest-coverage-strategy.md)
- [Component 경계](../04-client-engineering/ui/component-boundary.md)
- [개발 접근 방식](../05-development/development-approach.md)
- [Feature 기반 구조](../02-architecture/feature-based-structure.md)
- [Boolean Naming Convention](../05-development/boolean-naming-convention.md)

---

## 요약

Storybook은 repository-wide component coverage 도구가 아닙니다.

```txt
Custom reusable UI
-> comprehensive Storybook coverage

Selected layout/menu UI
-> application-wide visual inspection

Selected feature presentation
-> small, independent exceptions

Domain / workflow correctness
-> Vitest

Full application workflow
-> Live Demo / future E2E
```

기존 `/demo` component playground에서 가능했던 public parameter 조절과 interaction은
Story, Controls, args connection 및 controlled result로 이전했습니다. Application route는
실제 product workflow와 embedded Storybook entry에 집중하고, reusable UI의 독립적인
개발·검토 책임은 Storybook이 담당합니다.

---

## 상태

승인 및 구현 완료
