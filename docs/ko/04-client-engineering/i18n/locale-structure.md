# 로케일 구조

## 목표

로컬라이제이션 구조는 번역 문구의 소유 책임을 명시적으로 유지하면서 큰 namespace를 더 작은 소스 파일로 관리할 수 있게 합니다. 번역 키는 해당 문구를 표시하는 route나 component가 아니라 문구를 소유하는 애플리케이션 책임을 따라야 합니다.

이 구조의 목표는 다음과 같습니다.

- 지원하는 모든 언어에서 동일한 namespace와 key 구조를 유지합니다.
- 공용 어휘, 재사용 component 문구, feature 문구를 분리합니다.
- 하나의 과도하게 큰 JSON 파일을 만들지 않고 큰 namespace를 확장합니다.
- 번역 호출을 명시적이고 추적하기 쉽게 유지합니다.

## Runtime 모델

Namespace contract는 `src/lib/application/i18n`에 둡니다. 각 언어는 `locales/<language>/index.ts`에서 조합하며, `src/lib/client/i18n/runtime.ts`가 완성된 resource를 i18next에 등록합니다.

현재 runtime은 `en`, `es`, `fr`, `ko`를 모두 eager bundle합니다. 따라서 namespace를 디렉터리로 분리하는 것은 소스 소유권을 위한 결정이며 route 또는 namespace 단위 lazy loading을 제공하지 않습니다. 영어는 fallback 언어로 유지합니다.

## Namespace 목록

애플리케이션은 현재 `NS`를 통해 다음 namespace를 등록합니다.

```txt
auth
common
component
dashboard
demo
documents
error
message
serviceDesk
settings
shared
validation
```

Namespace 문자열을 반복해서 작성하지 말고 `NS` 상수를 사용합니다.

```ts
const { t } = useTranslation(NS.serviceDesk);

t("field.priority", { ns: NS.common });
```

## 디렉터리 구조

지원하는 모든 언어는 동일한 구조를 사용합니다. 아래에서는 영어를 기준 예시로 사용합니다.

```txt
src/lib/application/i18n/locales/en/
├─ index.ts
├─ auth.json
├─ common.json
├─ dashboard.json
├─ message.json
├─ validation.json
├─ component/
├─ demo/
├─ documents/
├─ error/
├─ serviceDesk/
├─ settings/
└─ shared/
   ├─ enum.json
   └─ index.ts
```

작고 응집된 namespace는 하나의 JSON 파일로 유지할 수 있습니다. 서로 독립적인 소유 책임이 여러 개이거나 계속 커지는 catalog는 디렉터리와 `index.ts` 조합 경계를 사용합니다.

예를 들어 `serviceDesk`는 feature에 맞춘 fragment로 관리하지만 외부에는 하나의 i18next namespace로 제공합니다.

```ts
import insights from "./insights.json";
import shared from "./shared.json";
import ticket from "./ticket.json";
import ticketAction from "./ticketAction.json";

const serviceDesk = {
  ...shared,
  ...ticket,
  ...ticketAction,
  ...insights,
};

export default serviceDesk;
```

물리적으로 파일을 분리하더라도 소비자가 특정 key를 소유하는 fragment까지 알아야 하는 구조가 되어서는 안 됩니다. 소비자는 계속 `NS.serviceDesk`와 기존 공개 key 경로를 사용합니다.

## Namespace 책임

### `common`

애플리케이션 전반에서 공유하는 일반 UI 어휘를 소유합니다.

- 저장, 취소, 검색 같은 action label
- 공통 field 이름
- pagination, sort, table, empty state 어휘
- 일반 placeholder

`common`은 재사용 가능한 interface 언어를 설명하며 안정적인 코드 값 catalog를 소유하지 않습니다.

### `shared`

Selector, filter, badge와 같은 소비자가 표시할 수 있는 안정적인 애플리케이션 값의 다국어 label을 소유합니다.

현재 예시는 다음과 같습니다.

```txt
shared.enum.accessLevel
shared.enum.priority
shared.enum.riskLevel
shared.enum.dueAt
```

`shared` namespace의 책임은 의도적으로 좁게 유지합니다. 안정적인 애플리케이션 값을 사용자에게 표시할 label로 매핑할 때만 key를 추가합니다. Page 문구, validation 문구, workflow message, component 안내 문구는 여기에 두지 않습니다.

```ts
const { t } = useTranslation(NS.shared, {
  keyPrefix: "enum.priority.options",
});

const highLabel = t("high");
```

일반 date range preset label은 공용 애플리케이션 enum catalog가 아니라 재사용 DatePicker 제품의 일부이므로 `component.datePicker`가 계속 소유합니다.

### `component`

DatePicker, RichEditor, combo box와 같은 재사용 애플리케이션 component 내부의 placeholder, empty state, interaction label을 소유합니다.

### `storybook`

`src/stories`에서 component 상태와 fixture를 설명하기 위해 사용하는 문구를 소유합니다. 실제 application page 문구는 이 namespace에 두지 않습니다.

홈 화면 문구는 `dashboard`, Service Desk 초기화 문구는 `serviceDesk` namespace가 각각 소유합니다.

### Feature namespace

`serviceDesk`, `settings`, `documents`, `auth`는 각각의 애플리케이션 책임에 해당하는 workflow와 page 문구를 소유합니다. Component 자체가 feature에 소속되지 않는 한 재사용 component가 이러한 namespace에 의존해서는 안 됩니다.

### Feedback namespace

- `validation`: input과 schema의 inline validation feedback
- `message`: 성공 및 확인 문구 같은 예상 가능한 action feedback
- `error`: system, API, 예외적 failure message

세부 feedback 정책은 [검증 메시지](./validation-messages.md)를 참고합니다.

## 소유 책임 결정

번역 문구를 어디에 둘지는 다음 순서로 판단합니다.

1. 재사용 component가 동작과 문구를 소유하면 `component`를 사용합니다.
2. 안정적인 애플리케이션 값을 label로 매핑하면 `shared`를 사용합니다.
3. Feature workflow 또는 page가 문구를 소유하면 해당 feature namespace를 사용합니다.
4. 일반 UI 어휘이면 `common`을 사용합니다.
5. Validation, action feedback, 예외적 failure를 전달하면 각각 `validation`, `message`, `error`를 사용합니다.

`shared`와 `common`을 소유 책임이 불분명한 문구의 기본 저장 위치로 사용해서는 안 됩니다. Key를 추가하기 전에 소유자를 먼저 결정합니다.

## 언어 간 구조 일치

모든 구조 변경은 `en`, `es`, `fr`, `ko`에 함께 적용해야 합니다.

- 디렉터리와 파일 이름이 일치해야 합니다.
- 조합된 namespace 구조가 일치해야 합니다.
- 공개 key 경로를 안정적으로 유지해야 합니다.
- 영어는 영어가 아닌 catalog에 key가 없을 때 fallback 문구를 제공합니다.

기존 JSON 파일을 분리할 때는 이전 파일을 제거하기 전에 조합된 값과 원본 객체를 비교합니다.

## 네이밍과 접근

예측 가능하고 의미가 분명한 key 경로와 명시적인 namespace 접근을 선호합니다.

```ts
const { t: tShared } = useTranslation(NS.shared);

tShared(`enum.riskLevel.options.${riskLevel}`);
```

Namespace 문자열을 직접 사용하지 않습니다.

```ts
// 지양
t("enum.priority.options.high", { ns: "shared" });

// 권장
t("enum.priority.options.high", { ns: NS.shared });
```

`shared`라는 locale namespace는 저장소의 `src/shared` 코드 layer와 무관합니다. 마찬가지로 feature namespace는 TypeScript domain 경계를 정의하지 않습니다.

## 안티패턴

- 하나의 전역 번역 파일
- 기존 소유자가 명확한데도 page 하나를 위한 namespace 생성
- 동일한 value label을 `shared`와 `component`에 중복 정의
- validation, success message, feature 문구 혼합
- 한 언어에서만 파일 분리
- 물리적인 파일 재구성만을 이유로 공개 key 경로 변경
- 디렉터리 분리가 runtime lazy loading을 제공한다고 가정

## 요약

Namespace는 공개 번역 contract이고 파일과 디렉터리는 그 contract 뒤에 있는 유지보수 세부 사항입니다. 작은 namespace는 응집된 상태로 유지하고, 커지는 namespace는 책임 기준으로 분리하며, `shared`는 안정적인 값과 label의 catalog로 제한합니다. 모든 지원 언어에서 조합 결과가 동일한 구조를 유지해야 합니다.
