# Storybook Coverage 전략 (2026-09)

## 배경

2026년 9월에는 위험에 따라 Vitest 검증 범위를 정리한 뒤, 재사용 UI 컴포넌트의
시각 상태와 브라우저 조작을 어디서 검증할지 별도로 결정해야 했습니다.

Vitest는 다음 영역을 중심으로 애플리케이션 동작이 올바른지 검증합니다.

```txt
domain rule
-> authorization
-> Route Handler
-> server workflow
-> feature orchestration
-> page/view-model composition
```

프로젝트가 직접 만든 재사용 UI는 다음 특성을 독립적인 브라우저 환경에서
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

Storybook 검증 범위가 늘면서 애플리케이션 페이지와 Storybook이 같은 컴포넌트
검토 역할을 중복해서 맡게 되었습니다. 따라서 Storybook의 전체 검증 범위와
기존 `/demo` 체험 페이지를 대체하는 기준을 함께 정리했습니다.

---

## 문제

### 1. Story가 존재하는 것만으로 Demo Playground를 대체할 수 없음

Storybook Controls가 있어도 `args`가 실제 컴포넌트에 전달되지 않으면 공개 매개변수를
바꾸며 동작을 확인할 수 없습니다. 외부에서 값을 제어하는 컴포넌트가
`useState(args.value)`의 초기값만 사용하면 이후 Controls 변경과 Canvas 조작이
서로 다른 상태를 보여줄 수 있습니다.

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

의미가 다른 상태와 매개변수 값의 연속적인 변화를 구분하지 않으면 비슷한 Story가
불필요하게 늘어납니다.

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

하나의 Meta에서 다른 공개 컴포넌트를 사용자 정의 render로만 표시하면 해당
컴포넌트의 prop이 Controls에 드러나지 않을 수 있습니다. Storybook 구성은 소스
폴더 묶음보다 공개 컴포넌트 API와 기대 동작을 기준으로 해야 합니다.

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

예를 들어 `Step 1: Request`는 Stepper 자체의 변형이 아니라 호출자가 전달한 레이블
구성입니다. Storybook 편의만을 위해 실제 컴포넌트 API에 없는 변형을 추가하면
Story가 실제 공개 API와 다른 동작을 설명하게 됩니다.

### 6. Storybook 전용 Contract는 Production과 Drift할 수 있음

실제 코드에 옵션 상수나 타입이 있으면 Storybook도 이를 재사용합니다. 같은 옵션을
Story에 별도로 하드코딩하거나 Storybook 전용 prop을 실제 컴포넌트에 추가하면
두 API 정의가 서로 다르게 바뀔 수 있습니다.

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

두 환경에서 애플리케이션 맥락과 독립적인 렌더링을 모두 확인할 수 있지만, 같은
custom 컴포넌트·fixture·조작 UI를 중복 관리해야 합니다. 두 환경의 상태 예시와
fixture가 서로 달라질 위험도 있습니다.

Storybook에서 같은 수준 이상으로 컴포넌트를 검토할 수 있으므로 이 방식을 장기
구조로 채택하지 않았습니다.

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

이 구조에서는 `/demo` 체험 페이지를 대체하되, Storybook에 또 하나의 애플리케이션을
구현하지 않습니다.

---

## 결정

### 1. `src/components/custom`은 포괄적인 Storybook Coverage 대상임

프로젝트가 직접 만든 재사용 custom 컴포넌트의 공개 API 묶음은 가능한 한 모두
Storybook에서 검토합니다. 내부 구현 파일마다 Story를 만들지는 않습니다.

```txt
public component contract
-> Storybook Meta

internal implementation detail
-> covered through the public component
```

### 2. Layout과 Menu는 선별적으로 포함함

`src/components/layout`과 `src/components/menu`에서는 애플리케이션 공통 시각 상태를
독립적으로 확인할 가치가 있는 컴포넌트만 선별합니다. 실행 환경을 과도하게
재현해야 하는 컴포넌트는 제외합니다.

현재 구현된 대상은 다음과 같습니다.

```txt
Layout/RouteLoading
Menu/PreferencesMenu
Menu/UserMenu
```

### 3. Feature Story는 독립적인 Presentation Component로 제한함

기능의 업무 흐름이나 컨테이너 전체를 Storybook으로 옮기지 않습니다. 도메인 타입을
재사용하면서 API나 업무 처리 기반 기능 없이 렌더링할 수 있는 표시 컴포넌트만
소수 허용합니다.

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

Story나 Story 파일 수는 품질 지표가 아닙니다. 공개 API와 기대 동작을 독립적으로
검토할 수 있는지가 검증 범위의 판단 기준입니다.

### 5. 의미적으로 다른 상태는 Story로 표현함

`Default`, `WithValue`, `Empty`, `Disabled`, `ReadOnly`, `Loading`, `Multiple`처럼 사용자가
구분해서 확인할 가치가 있는 상태는 별도 Story로 표현할 수 있습니다.

값만 연속적으로 달라지는 매개변수는 비슷한 Story를 여러 개 만드는 대신 조절할
수 있도록 제공합니다.

### 6. Continuous Public Parameter는 Controls로 제공함

다음처럼 조절 가능한 값은 기본적으로 Storybook Controls에서 제공합니다.

```txt
maxImages
minDate / maxDate
minuteStep
maxCount / maxSizeMB
orientation
indentation
collapsible
```

Controls가 같은 역할을 제공하면 데모 전용 `<Input>`, `<Select>`, `<Switch>`를
별도로 만들지 않습니다.

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

필요하면 `useArgs`나 같은 역할을 하는 Storybook 상태 제어 패턴을 사용합니다.
초기 args만 로컬 상태에 복사하고 이후 Control 변경을 무시하는 구조는 허용하지
않습니다.

### 8. Meta는 Public Component Contract를 기준으로 분리함

같은 소스 묶음에 있어도 공개 API가 실질적으로 다르면 Meta를 분리합니다. 당시
Avatar, DatePicker, HierarchicalSelect, MultiComboBox 묶음은 공개 컴포넌트별로
분리되어 있었습니다.

### 9. Production Contract를 다시 정의하지 않음

Storybook은 실제 코드의 타입, 옵션 상수, 공개 enum·값 정의를 재사용합니다.
예를 들어 DateRangePicker의 preset Control은 실제 코드의
`DEFAULT_DATE_RANGE_PRESETS`를 사용합니다.

Storybook 사용 편의만을 위한 prop을 실제 컴포넌트에 추가하지 않습니다.

### 10. Caller Composition을 Component Variant와 구분함

Stepper의 숫자 레이블은 호출자가 전달한 콘텐츠를 보여주는 구성 Story로 표현합니다.
Stepper에 `showStepNumber`나 `showStepPrefix`처럼 호출자가 담당할 역할을 추가하지
않습니다.

### 11. Browser Interaction은 Inspection 가치에 따라 검증함

Storybook Canvas에서는 공개 API가 지원하는 다음 조작을 확인할 수 있어야 합니다.

- select, remove 및 clear
- date/range 선택
- text/editor input
- attachment add/remove
- tree expand/collapse 및 지원되는 reordering
- step navigation

수동 Canvas 조작으로 충분할 수 있습니다. 안정적이고 회귀 방지 효과가 큰 경우에만
`play`를 추가합니다. 현재 ColorPicker, FileAttachment, RichEditor, SortableTree,
Stepper Story에는 `play` 상호작용이 있습니다.

### 12. Full Application Workflow는 Storybook으로 이동하지 않음

다음과 같은 전체 업무 흐름은 Vitest와 Live Demo가 각자의 담당 범위에서 검토합니다.

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

향후 실제 브라우저에서 여러 페이지에 걸친 회귀 검증이 필요하면 Playwright E2E로
검토합니다. Storybook에 애플리케이션의 provider와 API 구조 전체를 복제하지 않습니다.

### 13. 기존 `/demo` Playground를 Storybook으로 대체함

`src/app/(protected)/demo`에서 custom 컴포넌트를 확인하던 기능은 Storybook의 Story,
Controls, args 연결, UI 조작과 관찰 가능한 결과 표시로 옮겼습니다.

해당 페이지에는 Storybook으로 옮기기 어려운 업무 처리 역할이 없었으므로
삭제했습니다.

```txt
previous
-> src/app/(protected)/demo

current
-> src/components/custom
-> src/stories
-> Storybook
```

로그인 화면의 `Try Demo`, LOCAL 실행 환경, 변경 가능한 데모 상태, Service Desk Live
Demo는 유지합니다. 삭제한 것은 custom 컴포넌트를 확인하던 애플리케이션 내부
체험 페이지입니다.

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

기본 `npm test`는 `unit` 프로젝트만 실행합니다. Storybook 브라우저 프로젝트는 아직
모든 테스트 통과를 요구하는 CI 필수 검사가 아닙니다.

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

당시 Storybook 브라우저 프로젝트는 Story 테스트 94개 중 90개가 통과했습니다.
다음 네 개의 `play` 시나리오는 Vitest 브라우저 실행기에서 실패한 상태로 남았습니다.

```txt
ColorPicker / Default
RichEditor / Empty
SortableTree / Collapse Interaction
Stepper / Default
```

따라서 브라우저 프로젝트는 필수 CI 검사 대신 문제를 확인하는 진단 검사로 사용합니다.
이 상태가 채택한 검증 범위를 바꾸지는 않습니다. 해당 실패를 해결하기 전에는
자동 상호작용 검사가 모두 통과했다고 설명하지 않습니다.

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

이 경우에도 저장소 전체로 한 번에 확대하지 않습니다. 프로젝트가 관리하는 공개 API와
회귀 위험을 기준으로 범위를 다시 결정합니다.

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

기존 `/demo` 체험 페이지에서 제공하던 공개 매개변수 조절과 UI 조작은 Story,
Controls, args 연결, 제어된 결과 표시로 옮겼습니다. 애플리케이션 페이지는 실제
업무 흐름과 Storybook 진입 화면을 담당하고, 재사용 UI의 독립적인 개발·검토는
Storybook이 담당합니다.

---

## 상태

승인 및 구현 완료
