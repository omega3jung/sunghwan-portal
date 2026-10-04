# 로케일 구조

## 목표

다국어 문구는 담당 역할별 namespace(번역 키의 묶음)로 구분하고, 큰 묶음은 작은
소스 파일로 나누어 관리합니다. 번역 키의 위치는 문구를 표시하는 라우트나 컴포넌트가
아니라, 그 문구의 의미와 동작을 담당하는 애플리케이션 역할에 따라 정합니다.

이 구조의 목표는 다음과 같습니다.

- 지원하는 모든 언어에서 동일한 namespace와 key 구조를 유지합니다.
- 공용 어휘, 재사용 component 문구, feature 문구를 분리합니다.
- 하나의 과도하게 큰 JSON 파일을 만들지 않고 큰 namespace를 확장합니다.
- 번역 호출을 명시적이고 추적하기 쉽게 유지합니다.

## Runtime 모델

Namespace 정의는 `src/lib/application/i18n`에 둡니다. 각 언어의 번역 파일은
`locales/<language>/index.ts`에서 조합하며, `src/lib/client/i18n/runtime.ts`가
완성된 번역 리소스를 i18next에 등록합니다.

현재 실행 환경은 `en`, `es`, `fr`, `ko`를 모두 처음부터 번들에 포함합니다. 따라서
디렉터리 분리는 소스 관리 책임을 나누기 위한 결정입니다. 라우트나 namespace별로
필요할 때 불러오는 지연 로딩은 제공하지 않습니다. 번역이 없으면 영어 문구를 사용합니다.

## Namespace 목록

애플리케이션은 현재 `NS`를 통해 다음 namespace를 등록합니다.

```txt
auth
common
component
dashboard
documents
error
message
serviceDesk
settings
shared
storybook
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
├─ storybook.json
├─ validation.json
├─ component/
├─ documents/
├─ error/
├─ serviceDesk/
├─ settings/
└─ shared/
   ├─ enum.json
   └─ index.ts
```

작고 관련성이 높은 namespace는 JSON 파일 하나로 유지할 수 있습니다. 독립된
역할이 여러 개이거나 문구 목록이 계속 커지면 디렉터리로 나누고 `index.ts`에서 조합합니다.

예를 들어 `serviceDesk`는 기능별 번역 조각으로 관리하지만 호출부에는 하나의
i18next namespace로 제공합니다.

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

파일을 나눠도 호출부가 번역 키를 담은 개별 파일까지 알 필요는 없어야 합니다.
호출부는 계속 `NS.serviceDesk`와 기존 공개 키 경로를 사용합니다.

## Namespace 책임

### `common`

애플리케이션 전반에서 공유하는 일반 UI 어휘를 소유합니다.

- 저장, 취소, 검색 같은 동작 레이블
- 공통 필드 이름
- 페이지네이션, 정렬, 표, 빈 결과를 설명하는 어휘
- 일반 입력 안내 문구

`common`은 재사용 UI 문구를 담당합니다. 고정된 코드 값의 표시 이름 목록은 담당하지 않습니다.

### `shared`

선택기, 필터, 배지 등에서 표시하는 고정된 애플리케이션 값의 다국어 레이블을 담당합니다.

현재 예시는 다음과 같습니다.

```txt
shared.enum.accessLevel
shared.enum.priority
shared.enum.riskLevel
shared.enum.dueAt
```

`shared`의 역할은 고정된 애플리케이션 값의 표시 이름으로 제한합니다. 값을 사용자에게
보여줄 레이블로 바꿀 때만 키를 추가합니다. 페이지 문구, 검증 문구, 업무 처리 메시지,
컴포넌트 안내 문구는 여기에 두지 않습니다.

```ts
const { t } = useTranslation(NS.shared, {
  keyPrefix: "enum.priority.options",
});

const highLabel = t("high");
```

일반 date range preset label은 공용 애플리케이션 enum catalog가 아니라 재사용 DatePicker 제품의 일부이므로 `component.datePicker`가 계속 소유합니다.

### `component`

DatePicker, RichEditor, 콤보 상자처럼 재사용하는 애플리케이션 컴포넌트의 입력 안내,
빈 결과 문구, 상호작용 레이블을 담당합니다.

### `storybook`

`src/stories`에서 컴포넌트 상태와 테스트용 데이터(fixture)를 설명하는 문구를 담당합니다.
실제 애플리케이션 페이지 문구는 이 namespace에 두지 않습니다.

홈 화면 문구는 `dashboard`, Service Desk 초기화 문구는 `serviceDesk` namespace가 각각 소유합니다.

### Feature namespace

`serviceDesk`, `settings`, `documents`, `auth`는 각 기능의 업무 흐름과 페이지 문구를
담당합니다. 해당 기능 전용 컴포넌트가 아니라면 재사용 컴포넌트는 이 namespace에
의존해서는 안 됩니다.

### Feedback namespace

- `validation`: 입력·스키마 검증 결과를 필드 옆에 표시하는 메시지
- `message`: 성공·확인 문구처럼 예상 가능한 작업 결과 메시지
- `error`: 시스템·API 오류와 예외적 실패 메시지

세부 feedback 정책은 [검증 메시지](./validation-messages.md)를 참고합니다.

## 소유 책임 결정

번역 문구를 어디에 둘지는 다음 순서로 판단합니다.

1. 재사용 component가 동작과 문구를 소유하면 `component`를 사용합니다.
2. 안정적인 애플리케이션 값을 label로 매핑하면 `shared`를 사용합니다.
3. Feature workflow 또는 page가 문구를 소유하면 해당 feature namespace를 사용합니다.
4. 일반 UI 어휘이면 `common`을 사용합니다.
5. Validation, action feedback, 예외적 failure를 전달하면 각각 `validation`, `message`, `error`를 사용합니다.

담당 역할이 불분명한 문구를 `shared`나 `common`에 넣지 않습니다. 키를 추가하기
전에 담당 역할을 먼저 결정합니다.

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

번역 namespace인 `shared`는 저장소의 `src/shared` 코드 계층과 무관합니다.
기능별 번역 namespace도 TypeScript 도메인 계층을 정의하지 않습니다.

## 안티패턴

- 하나의 전역 번역 파일
- 기존 소유자가 명확한데도 page 하나를 위한 namespace 생성
- 동일한 value label을 `shared`와 `component`에 중복 정의
- validation, success message, feature 문구 혼합
- 한 언어에서만 파일 분리
- 물리적인 파일 재구성만을 이유로 공개 key 경로 변경
- 디렉터리 분리가 runtime lazy loading을 제공한다고 가정

## 요약

Namespace는 호출부가 사용하는 번역 키의 공개 구조입니다. 파일과 디렉터리는 이를
관리하기 위한 내부 구성입니다. 작은 namespace는 관련 문구를 함께 유지하고, 커지는
namespace는 역할별로 나눕니다. `shared`는 고정된 값과 표시 레이블 목록으로 제한하며,
모든 지원 언어의 조합 결과가 같은 구조를 유지해야 합니다.
