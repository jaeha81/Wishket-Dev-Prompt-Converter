# validation-log — 검증 결과 기록

> 포맷: 날짜 | 대상 | 방법 | 결과

---

## 2026-05-16 | Phase 1 타입 스키마 | pnpm typecheck | ✅ 통과

- 대상: `src/types/` 10개 파일 (9개 스키마 + index.ts barrel)
- 명령어: `pnpm typecheck` (= `tsc --noEmit`)
- 결과: 오류 0개
- 검증자: Claude (구현 완료 직후 자기 검증)
- 미검증 항목: 실제 데이터 입력 테스트 없음 (Phase 3 예정)

---

## 2026-05-16 | Phase 2 모듈 | pnpm typecheck | ✅ 통과

- 대상: `src/intake/index.ts`, `src/analysis/index.ts`
- 명령어: `pnpm typecheck`
- 결과: 오류 0개
- 검증자: Claude (구현 완료 직후 자기 검증)
- 미검증 항목:
  - `parseInquiry()` 실제 위시켓 텍스트 입력 테스트 미실시
  - `analyzeInquiry()` 엣지케이스 (빈 입력, 필드 전부 모호 등) 미테스트
  - Codex 코드 리뷰 미실시

### 다음 검증 세션에서 할 일
- [ ] `data/samples/` 에 실제 위시켓 의뢰서 샘플 2~3개 추가
- [ ] `tests/intake.test.ts` 작성: 정상 파싱 / 빈 입력 / 비표준 형식
- [ ] `tests/analysis.test.ts` 작성: 누락 탐지 / 모호 탐지 / 신뢰도 계산
- [ ] Codex에게 intake + analysis 로직 리뷰 요청

---

## 기록 약속

- 타입 체크만 통과한 항목은 `[미검증 완료]` 표시
- 실제 데이터로 확인한 항목만 `[검증 완료]` 표시
- Codex 리뷰를 거친 항목은 `[Codex 검토]` 표시

---

## 2026-05-23 | Phase 3 MVP + P0 재검수 수정 | corepack pnpm typecheck/test | ✅ 통과

- 대상:
  - `src/intake/index.ts`
  - `src/analysis/index.ts`
  - `src/classification/index.ts`
  - `src/consultation/index.ts`
  - `data/samples/sample-01.txt`
  - `tests/intake.test.mjs`
  - `tests/analysis.test.mjs`
- 변경:
  - intake 멀티라인 필드 파서를 다음 레이블 경계 기준으로 수정
  - analysis 요구사항 컨텍스트에 제목/기술/산출물/예산/일정/리스크 반영
  - classification MVP 구현
  - consultation MVP 구현
  - 샘플 의뢰서 기반 테스트 추가
- 명령어:
  - `corepack pnpm typecheck`
  - `corepack pnpm test`
- 결과:
  - typecheck 오류 0개
  - Node test 2개 통과
- 참고:
  - 이전 handoff의 `D:\ai프로젝트\Wishket Dev Prompt Converter` 경로는 현재 PC에 없음
  - 실제 작업 경로는 `C:\ai프로젝트\Wishket-Dev-Prompt-Converter`

---

## 2026-05-23 | Phase 3 잔여 MVP 모듈 | corepack pnpm typecheck/test | ✅ 통과

- 대상:
  - `src/estimate/index.ts`
  - `src/risk/index.ts`
  - `src/messaging/index.ts`
  - `src/approval/index.ts`
  - `tests/phase3.test.mjs`
- 변경:
  - Estimate: 비용/일정 범위와 전제 조건 산정
  - Risk: 누락/모호/스크래핑/개인정보/자동발송 리스크 평가
  - Messaging: 위시켓/이메일/텔레그램 채널별 초안 생성, 발송 전 승인 문구 포함
  - Approval: 승인 요청/결정/canSend 게이트 구현
- 명령어:
  - `corepack pnpm typecheck`
  - `corepack pnpm test`
- 결과:
  - typecheck 오류 0개
  - Node test 5개 통과
  - 승인 전 메시지 발송 불가 조건 테스트 포함

---

## 2026-05-23 | Phase 4 MVP 모듈 | corepack pnpm typecheck/test | ✅ 통과

- 대상:
  - `src/prompt-generation/index.ts`
  - `src/validation/index.ts`
  - `src/delivery-package/index.ts`
  - `prompts/claude-implementation-template.md`
  - `prompts/codex-goal-validation-template.md`
  - `tests/phase4.test.mjs`
- 변경:
  - Claude 구현 프롬프트 생성
  - Codex Goal 검증 프롬프트 생성
  - Codex 검증 요청/결과 Adapter 생성
  - 승인/검증/리스크 기반 고객 제공 패키지 생성
- 명령어:
  - `corepack pnpm typecheck`
  - `corepack pnpm test`
- 결과:
  - typecheck 오류 0개
  - Node test 8개 통과
  - 승인 전 납품 차단, 승인 후 준비 상태 테스트 포함

---

## 2026-05-23 | README/샘플/E2E 보강 | corepack pnpm typecheck/test | ✅ 통과

- 대상:
  - `README.md`
  - `data/samples/sample-02.txt`
  - `data/samples/sample-03.txt`
  - `tests/e2e.test.mjs`
- 변경:
  - 설치/검증/안전 원칙/파이프라인 README 작성
  - 스크래핑 리스크 샘플 추가
  - 개인정보/이메일 알림 리스크 샘플 추가
  - 샘플 3개 전체 MVP 파이프라인 테스트 추가
- 명령어:
  - `corepack pnpm typecheck`
  - `corepack pnpm test`
- 결과:
  - typecheck 오류 0개
  - Node test 9개 통과

---

## 2026-05-23 | Codex 독립 리뷰 | rg + typecheck/test | ✅ 신규 이슈 없음

- 확인:
  - 실제 발송 API 호출 코드 없음
  - 고객 메시지는 초안 문구와 승인 안내 포함
  - `canSend()`는 `approved` + approver + decided_at 조건 필요
  - delivery package는 승인/검증/고위험 리스크를 준비 상태 판단에 반영
- 명령어:
  - `rg -n "send|post|fetch|axios|request|nodemailer|smtp|discord|telegram|approved|canSend|state === 'approved'|자동 발송|발송" src tests README.md llm-wiki`
  - `corepack pnpm typecheck`
  - `corepack pnpm test`
- 결과:
  - 신규 WARN/CRITICAL 없음
  - typecheck 오류 0개
  - Node test 9개 통과

---

## 2026-05-23 | Manual E2E CLI | run:e2e + typecheck/test | PASS

- 대상:
  - `src/cli.ts`
  - `tests/cli.test.mjs`
  - `README.md`
- 변경:
  - 문의 텍스트 파일 1개를 전체 MVP 파이프라인에 넣는 CLI 추가
  - JSON/Markdown 산출물을 `data/outputs/`에 저장
  - 기본값은 승인/검증 미완료 상태이며, `--approve --validation-pass`를 줘야 수동 통과로 기록
- 명령:
  - `corepack pnpm typecheck`
  - `corepack pnpm test`
  - `corepack pnpm run:e2e -- data/samples/sample-03.txt --out data/outputs --approve --validation-pass`
- 결과:
  - typecheck 오류 0개
  - Node test 10개 통과
  - 샘플 E2E 산출물 생성 완료
  - 결과 `ready=false`: 승인/검증은 통과했지만 risk level high라 추가 검토 필요
  - GitHub push 완료: `8e359de feat: add manual E2E CLI`
