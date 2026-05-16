# project-overview — Wishket Client Automation Hub

> 갱신: 2026-05-16

## 한 줄 요약

위시켓 의뢰서를 자동으로 읽고, 분석하고, 고객 상담 메시지 초안까지 만들어주는 반자동 파이프라인.

## 왜 만드나

프리랜서 개발자가 위시켓 의뢰서를 받을 때마다 반복하는 작업:
1. 의뢰서 내용 정리 → 2. 요구사항 파악 → 3. 누락 항목 질문 → 4. 견적 계산 → 5. 상담 메시지 작성

이 5단계를 AI가 초안을 잡아주면 사람은 검토·승인만 한다.

## 파이프라인 8단계 (개발.MD §4)

```
원문 텍스트
  └─ [1] intake       — 텍스트 정규화 → InquiryInput
  └─ [2] analysis     — 요구사항 추출, 누락/모호 탐지 → AnalysisResult
  └─ [3] classification — 작업 유형·난이도 분류 → Classification
  └─ [4] consultation  — 사전 상담 메시지 초안 → ConsultationMessage
  └─ [5] estimate      — 견적 범위 산정 → Estimate
  └─ [6] risk          — 리스크 평가 → RiskAssessment
  └─ [7] messaging     — 채널별 메시지 포맷팅 → ChannelMessage
  └─ [8] approval      — 사람 승인 후 발송 → ApprovalRecord
```

## 핵심 제약 (변경 불가)

| 제약 | 이유 |
|------|------|
| Claude = 구현, Codex = 검증 (역할 교차 금지) | 품질 이중화 |
| 고객 메시지 전달 전 반드시 사람 승인 | 오발송 방지 |
| 위시켓 자동 크롤링 금지 | 서비스 약관 준수 |

## 디렉토리 구조

```
src/
  intake/          ← [1] 텍스트 정규화 ✅
  analysis/        ← [2] 요구사항 추출 ✅
  classification/  ← [3] 미구현
  consultation/    ← [4] 미구현
  estimate/        ← [5] 미구현
  risk/            ← [6] 미구현
  messaging/       ← [7] 미구현
  approval/        ← [8] 미구현
  prompt-generation/
  validation/
  delivery-package/
  utils/
  types/           ← 공용 TypeScript 양식지 10개 ✅
data/samples/      ← 샘플 의뢰서 (미작성)
data/outputs/      ← 처리 결과 출력
prompts/           ← LLM 프롬프트 템플릿 (미작성)
tests/             ← 테스트 코드 (미작성)
llm-wiki/          ← 세션 인수인계 문서
```

## 스택

- Node.js + TypeScript (ESM, strict)
- pnpm
- 외부 API: Telegram Bot, SMTP (이메일), 위시켓 알림 이메일
