# decision-log — 주요 설계 결정 기록

> 새 결정 추가 시: 날짜 | 결정 내용 | 이유 형식으로 맨 위에 추가

---

## 2026-05-16 | intake 파서를 LLM 없이 정규식으로 구현

**결정**: `parseInquiry()`는 OpenAI/Claude API를 호출하지 않고 순수 정규식으로 필드를 추출한다.

**이유**:
- API 비용 없이 빠르게 동작
- 위시켓 의뢰서 포맷이 어느 정도 일정하므로 정규식으로 충분
- LLM 기반 파싱은 Phase 3 이후 `prompt-generation/` 모듈에서 도입

**트레이드오프**: 비정형 의뢰서에서 일부 필드를 놓칠 수 있다. 그 경우 `missing_items`에 기록되어 후속 상담에서 보완한다.

---

## 2026-05-16 | analysis 모듈의 confidence는 단순 패널티 공식

**결정**: `confidence = 1 - (누락수 + 모호수 × 0.5) / 총필수필드수`

**이유**:
- ML 모델 없이 즉시 동작하는 휴리스틱 필요
- 정밀도보다 "상담 필요 여부 빠른 신호"가 목적
- 나중에 실제 결과 데이터로 가중치 조정 가능

---

## 2026-05-16 | ESM (type: "module") + moduleResolution: Bundler 선택

**결정**: `package.json`에 `"type": "module"`, `tsconfig.json`에 `moduleResolution: "Bundler"`

**이유**:
- 최신 Node.js 표준 (CommonJS 대신 ESM)
- barrel export(`index.ts`)에서 `.js` 확장자 필요 → `moduleResolution: Bundler`가 TypeScript `.ts` 파일을 `.js`로 해석해 타입 체크 통과

---

## 2026-05-16 | llm-wiki를 세션 인수인계 전용으로 사용

**결정**: `llm-wiki/` 폴더는 LLM 세션 간 상태 공유 전용. 코드 문서화(JSDoc)와 분리.

**이유**:
- 코드 내 주석은 "왜"만 설명 → 빠른 개발용
- llm-wiki는 "지금 어디까지 왔고 다음은 뭐냐" → 세션 재개용
- 두 용도를 섞으면 둘 다 지저분해짐
