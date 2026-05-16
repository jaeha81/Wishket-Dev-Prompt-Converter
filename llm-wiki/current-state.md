# current-state — Wishket Client Automation Hub

> 마지막 갱신: 2026-05-16

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

### 아직 안 한 것 (Phase 2)
- `src/intake/index.ts` — 의뢰서 텍스트 정규화 모듈
- `src/analysis/index.ts` — 요구사항 추출 + 누락 탐지 모듈
- `llm-wiki/` 6개 문서 콘텐츠 (현재는 빈 상태)
- 프롬프트 템플릿, 테스트 코드, 샘플 데이터

## 핵심 제약 (변경 불가)
- Claude = 구현 / Codex = 검증 (역할 교차 금지)
- 고객 메시지 전달 전 반드시 사람 승인
- 위시켓 자동 크롤링 금지
