# 폼 패턴

## 목표

폼 패턴은 복잡한 데이터 입력을 일관된 방식으로 처리하기 위한
**확장 가능하고, 타입 안전하며, 사용자 친화적인 폼 시스템**을 제공하도록 설계된다.

이 패턴의 목적은 다음과 같다.

- TypeScript를 통해 타입 안전성을 보장한다
- 검증과 단계 기반 입력으로 사용자 경험을 향상한다
- 재사용 가능한 패턴으로 보일러플레이트를 줄인다
- 폼 로직과 UI를 명확히 분리한다

---

## 핵심 원칙

```id="form-principle"
Form state should be isolated, controlled, and type-safe
```

---

## 폼 라이브러리

폼은 **react-hook-form**을 사용해 관리한다.

---

## 왜 react-hook-form 인가?

- 최소한의 리렌더링으로 성능에 유리하다
- TypeScript 지원이 강력하다
- 검증 로직과의 통합이 기본적으로 용이하다
- 폼 상태를 유연하게 제어할 수 있다
- uncontrolled input과 잘 맞는다

---

## 폼 구조

### 기본 구조

```tsx id="form-structure"
const form = useForm<FormValues>();

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField name="title" />
  </form>
</Form>;
```

---

## 타입 안전성

### 규칙

```id="type-rule"
All forms must define a TypeScript schema
```

---

### 예시

```ts id="form-type"
type TicketForm = {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
};
```

---

## 검증 전략

검증은 스키마 기반 검증 방식(예: `Zod`)으로 처리한다.

---

### 예시

```ts id="validation-example"
const schema = z.object({
  title: z.string().min(1),
});
```

---

### 장점

- 검증 로직을 중앙화할 수 있다
- 일관된 오류 메시지를 제공할 수 있다
- 타입 추론을 지원한다

---

## 다단계 폼 패턴

복잡한 입력 흐름(예: `TicketFormDialog`)에 사용한다.

---

### 구조

```tsx id="multi-step"
Step 1 -> Step 2 -> Step 3 -> Submit
```

---

### 특징

- 단계별 입력
- 단계 단위의 부분 검증
- 제출 시 최종 검증

---

### 상태 처리

- 모든 단계에서 단일 폼 인스턴스를 사용한다
- 단계 인덱스는 별도로 관리한다

---

## 필드 구조

### 규칙

```id="field-rule"
Each field should be self-contained and reusable
```

---

### 패턴

```tsx id="field-pattern"
<FormField
  control={form.control}
  name="title"
  render={({ field }) => <Input {...field} />}
/>
```

---

## useWatch 전략

필드 값을 동적으로 관찰할 때 사용한다.

---

### 예시

```ts id="usewatch-example"
const files = useWatch({
  control: form.control,
  name: "attachments",
});
```

---

### 참고

- 잘못된 `defaultValue` 타입 지정을 피해야 한다
- 필요하면 명시적 캐스팅을 우선한다

---

## 기본값 전략

### 규칙

```id="default-value"
Avoid incorrect defaultValue types
```

---

### 문제

- 제네릭 폼에서 타입 불일치가 발생할 수 있다

---

### 해결 방법

- 필요하지 않다면 `defaultValue`를 제거한다
- 타입 단언은 신중하게 사용한다

---

## Controlled vs Uncontrolled Inputs

### 전략

- 기본적으로는 uncontrolled input을 우선한다 (`react-hook-form` 기본 방식)
- 필요한 경우에만 controlled input을 사용한다

---

## 제출 흐름

### 패턴

```tsx id="submit-flow"
form.handleSubmit(onSubmit);
```

---

### 동작

- 폼을 검증한다
- mutation을 실행한다
- 성공/실패를 처리한다

---

## API 연계

### 규칙

```id="api-rule"
Form submission should trigger mutation, not direct API calls
```

---

### 예시

```ts id="mutation-flow"
const mutation = useMutation(createTicket);

const onSubmit = (data) => {
  mutation.mutate(data);
};
```

---

## 오류 처리

### 전략

- 필드 수준 오류 (검증)
- 폼 수준 오류 (API)

---

### 예시

- Validation -> 인라인 메시지
- API error -> toast 또는 alert

---

## 초기화 전략

### 사용 시점

- 성공적으로 제출한 뒤
- 다이얼로그가 닫힐 때

---

### 예시

```ts id="reset-example"
form.reset();
```

---

## UX 고려사항

### 1. 인라인 검증

- 오류는 필드 근처에 보여준다

---

### 2. Submit 비활성화

- 유효하지 않을 때 제출을 막는다

---

### 3. 로딩 상태

- 제출 중에는 입력을 비활성화한다

---

### 4. 단계 이동

- 유효하지 않으면 다음 단계로 이동하지 못하게 한다

---

## 재사용성 전략

### 공통 필드

- 공통 필드 (`Input`, `Select` 등)를 추출한다

---

### 기능 전용 필드

- 도메인 특화 로직은 해당 feature 내부에 유지한다

---

## 피하려는 안티패턴

### 1. 폼 상태를 전역 스토어에 저장

- 폼의 독립성을 깨뜨린다

---

### 2. UI와 검증 로직의 혼합

- 유지보수가 어려워진다

---

### 3. 중복된 검증 규칙

- 동작이 비일관적으로 변한다

---

### 4. Controlled Input의 과도한 사용

- 성능 저하를 유발한다

---

## 트레이드오프

### 장점

- 강력한 타입 안전성
- 높은 성능
- 확장 가능한 폼 구조
- 관심사의 명확한 분리

---

### 단점

- `react-hook-form` 학습 곡선이 있다
- 제네릭 타이핑이 약간 복잡할 수 있다
- 구조를 지키는 규율이 필요하다

---

## 고려한 대안

### 1. useState 기반 폼

- 단순하다
- 확장성이 떨어진다

---

### 2. Formik

- 널리 알려져 있다
- 리렌더링이 더 많다

---

### 3. 완전한 Controlled Form

- 상태가 명시적이다
- 성능 비용이 있다

---

## 설계 원칙과의 정렬

이 패턴은 다음 원칙과 정렬된다.

- 타입 안전성
- 성능 최적화
- 관심사 분리
- 재사용 가능한 UI 컴포넌트

---

## 요약

폼 패턴은 **타입 안전하고, 성능이 좋으며, 확장 가능한 접근 방식**을 제공하여,
복잡한 사용자 입력을 처리할 때 `react-hook-form`과 스키마 검증을 활용해
시스템 전반의 일관성과 유지보수성을 보장한다.
