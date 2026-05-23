# Wishket Dev Prompt Converter

위시켓 의뢰서 원문을 수동 입력해 분석, 작업 분류, 상담 초안, 견적 범위, 리스크, 채널별 메시지, 승인 게이트, 검증 프롬프트, 고객 제공 패키지 초안까지 만드는 TypeScript MVP.

## 원칙

- 자동 크롤링 없음. 사용자가 제공한 의뢰서 텍스트만 처리.
- 고객 메시지는 초안만 생성. 실제 발송 전 사람 승인 필수.
- 견적과 일정은 확정값이 아니라 범위와 전제 조건.
- 개인정보, 토큰, 연락처는 최소 저장과 마스킹 기준 필요.

## 설치

```powershell
corepack pnpm install
```

## 검증

```powershell
corepack pnpm typecheck
corepack pnpm test
```

현재 샘플 3개 기준 전체 MVP 파이프라인 테스트가 실행된다.

## Manual E2E CLI

```powershell
corepack pnpm run:e2e -- data/samples/sample-03.txt --out data/outputs
```

승인과 검증 통과를 수동 표시할 때만 아래 옵션을 붙인다.

```powershell
corepack pnpm run:e2e -- data/samples/sample-03.txt --out data/outputs --approve --validation-pass
```

출력은 `data/outputs/`에 JSON과 Markdown으로 저장된다. 이 폴더는 Git에 올리지 않는 실행 산출물이다.

## 흐름

```text
raw text
→ parseInquiry
→ analyzeInquiry
→ classifyInquiry
→ createConsultationMessage
→ estimateInquiry
→ assessRisk
→ createChannelMessage
→ createApprovalRequest / decideApproval
→ generatePrompts
→ createCodexValidationRequest
→ createDeliveryPackage
```

## 샘플

- `data/samples/sample-01.txt`: 엑셀 주문 자동화 + 알림 봇
- `data/samples/sample-02.txt`: 가격 수집 대시보드, 스크래핑 리스크
- `data/samples/sample-03.txt`: 문의 접수 API, 개인정보/이메일 알림 리스크

## 다음

- 실제 위시켓 의뢰서 1건으로 수동 E2E 검증
- Codex 독립 리뷰 결과를 `llm-wiki/validation-log.md`에 기록
- README 사용 예시를 실제 CLI/입출력 예제로 확장
