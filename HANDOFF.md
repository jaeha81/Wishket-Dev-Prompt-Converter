# Wishket Client Automation Hub — 세션 핸드오프

> 다른 PC / 다음 세션에서 이 파일을 먼저 읽고 이어서 시작.

---

## 현재 상태 (2026-05-16)

| 항목 | 상태 |
|------|------|
| 프로젝트 스펙 | ✅ `위시켓전용개발오케스트레이터.md` 완성 (539줄) |
| 개발 계획서 | ✅ `개발.MD` 완성 (17섹션, Phase 1~4 작업 지시서 포함) |
| GitHub push | ✅ `ac2d0a8` — init 커밋 push 완료 |
| Phase 1 구현 | ⏳ 미착수 — 사용자 착수 지시 대기 중 |

---

## 다음 작업: Phase 1 — 기반 구조 (MVP 착수)

`개발.MD` §16 Phase 1 작업 지시서 기준:

1. **파일 구조 생성**
   ```
   src/intake/ src/analysis/ src/classification/ src/consultation/
   src/estimate/ src/risk/ src/messaging/ src/approval/
   src/automation-spec/ src/prompt-generation/ src/validation/
   src/delivery-package/ src/types/ src/utils/
   data/samples/ data/outputs/
   prompts/ llm-wiki/ tests/
   ```

2. **스키마 정의** — `src/types/inquiry.ts` (InquiryInput JSON 스키마)

3. **환경 설정** — `.env.example`, `package.json` (Node.js/TypeScript 기반)

4. **MVP 모듈 1순위**:
   - `src/intake/index.ts` — 의뢰서 텍스트 정규화
   - `src/analysis/index.ts` — 요구사항 추출 + 누락 탐지
   - `llm-wiki/` 6개 문서 초안 생성

5. **Codex 검수 요청** — Phase 1 완료 후 Agent Room 큐 등록

---

## 핵심 제약 (변경 불가)

- Claude Code = 구현, Codex = 검증 (역할 교차 금지)
- 고객 메시지 전달 전 반드시 사람 승인
- 위시켓 자동 크롤링 금지 (수동 입력 또는 사용자 제공 데이터만)
- LLM Wiki 6개 문서는 세션 간 상태 인계 장치

---

## 참고

- 프로젝트 스펙 전문: `위시켓전용개발오케스트레이터.md`
- 개발 계획서 전문: `개발.MD`
- GitHub: https://github.com/jaeha81/Wishket-Dev-Prompt-Converter
