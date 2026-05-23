# current-state — Wishket Client Automation Hub

> 마지막 갱신: 2026-05-23 (README/샘플/E2E 보강 완료)

## Phase 1 — 완료 ✅

### 만들어진 것
- **서랍 구조** (19개 폴더): `src/` 14개 하위 폴더 + `data/samples`, `data/outputs`, `prompts`, `llm-wiki`, `tests`
- **데이터 양식지** (src/types/ 10개 파일):
  - `inquiry.ts` — 위시켓 의뢰서 입력 양식 (19개 항목)
  - `analysis.ts` — 의뢰서 분석 결과 양식
  - `classification.ts` — 작업 유형 분류 양식
  - `consultation.ts` — 사전 상담 메시지 초안 양식
  - `estimate.ts` — 견적 산정 양식
  - `risk.ts` — 리스크 평가 양식
  - `messaging.ts` — 채널별 메시지 출력 양식 (텔레그램/이메일/위시켓)
  - `approval.ts` — 사람 승인 기록 양식
  - `automation-spec.ts` — 자동화 개발 사양서 양식
  - `index.ts` — 위 9개 통합 목차
- **설정 파일**: `package.json`, `tsconfig.json`, `.env.example`, `.gitignore`
- **검증**: `pnpm typecheck` 오류 0개 통과

## Phase 2 — 완료 ✅

### 만들어진 것
- **`src/intake/index.ts`** — `parseInquiry(rawText)`: 위시켓 의뢰서 원문 → InquiryInput 정규화
  - 정규식 기반 섹션 파서 (레이블 자동 인식)
  - 목록 필드(기술 스택, 연락처 등) 자동 분리
- **`src/analysis/index.ts`** — `analyzeInquiry(inquiry)`: InquiryInput → AnalysisResult
  - 요구사항 추출 (기능/비기능/제약 자동 분류)
  - 필수 필드 누락 탐지
  - 모호 표현 7가지 패턴 탐지
  - 신뢰도(0.0~1.0) 산출
- **`llm-wiki/` 6개 문서**: project-overview, agent-registry, decision-log, validation-log, current-state, handoff-prompt
- **검증**: `corepack pnpm typecheck` + `corepack pnpm test` 통과 [샘플 데이터 검증 완료]

## Phase 3 — MVP 모듈 완료 ✅

### 2026-05-23 완료
- **`src/intake/index.ts` 보강** — 멀티라인 필드 파싱을 다음 레이블 경계 기준으로 수정
- **`src/analysis/index.ts` 보강** — 제목, 기술스택, 산출물, 예산, 일정, 리스크를 요구사항/제약 컨텍스트에 반영
- **`src/classification/index.ts` 신규** — 작업 유형, 난이도, 복잡도, 키워드 규칙 기반 분류
- **`src/consultation/index.ts` 신규** — 누락/모호 항목 질문, 견적 근거, 일정 전제, 고객 응대 초안 생성
- **`src/estimate/index.ts` 신규** — 비용/일정 범위와 전제 조건 산정
- **`src/risk/index.ts` 신규** — 누락/모호/스크래핑/개인정보/자동발송 리스크 평가
- **`src/messaging/index.ts` 신규** — 위시켓/이메일/텔레그램 채널별 복사 가능 초안 생성
- **`src/approval/index.ts` 신규** — 사람 승인 요청/결정/canSend 게이트
- **`data/samples/sample-01.txt` 신규** — 위시켓 의뢰서 형식 샘플
- **`tests/intake.test.mjs`, `tests/analysis.test.mjs`, `tests/phase3.test.mjs` 신규** — 샘플 기반 Node 테스트
- **검증**:
  - `corepack pnpm typecheck` 통과
  - `corepack pnpm test` 통과 (5 tests pass)

## Phase 4 — MVP 완료 ✅

### 2026-05-23 완료
- **`src/prompt-generation/index.ts` 신규** — Claude 구현 프롬프트 + Codex Goal 검증 프롬프트 생성
- **`src/validation/index.ts` 신규** — Codex 검증 요청/결과 Adapter
- **`src/delivery-package/index.ts` 신규** — 승인/검증/리스크 상태를 반영한 고객 제공 패키지 초안 생성
- **`prompts/claude-implementation-template.md` 신규**
- **`prompts/codex-goal-validation-template.md` 신규**
- **`tests/phase4.test.mjs` 신규** — 프롬프트, 검증, 승인 전 납품 차단, 승인 후 준비 상태 테스트
- **검증**:
  - `corepack pnpm typecheck` 통과
  - `corepack pnpm test` 통과 (8 tests pass)

## README/샘플/E2E 보강 — 완료 ✅

### 2026-05-23 완료
- **`README.md` 신규** — 설치, 검증, MVP 흐름, 안전 원칙, 샘플 설명 추가
- **`data/samples/sample-02.txt` 신규** — 가격 수집 대시보드/스크래핑 리스크 샘플
- **`data/samples/sample-03.txt` 신규** — 문의 접수 API/개인정보 리스크 샘플
- **`tests/e2e.test.mjs` 신규** — 샘플 3개 전체 MVP 파이프라인 검증
- **검증**:
  - `corepack pnpm typecheck` 통과
  - `corepack pnpm test` 통과 (9 tests pass)

### 아직 안 한 것
- 실제 위시켓 의뢰서 케이스로 수동 E2E 검증
- Codex 독립 리뷰 기록

## 핵심 제약 (변경 불가)
- Claude = 구현 / Codex = 검증 (역할 교차 금지)
- 고객 메시지 전달 전 반드시 사람 승인
- 위시켓 자동 크롤링 금지
