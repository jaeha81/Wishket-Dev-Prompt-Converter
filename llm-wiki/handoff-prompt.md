# handoff-prompt — 다음 세션 시작 명령문

> 다음 세션을 시작할 때 이 파일을 읽고 아래 명령문을 복사해서 사용한다.

---

## 다음 세션 시작 명령문

```
llm-wiki/current-state.md 읽고 Wishket 실제 의뢰서 수동 E2E + Codex 독립 리뷰 기록 케이브맨 실행
```

---

## 다음에 할 일

1. 실제 위시켓 의뢰서 1건으로 수동 E2E 검증
2. Codex 독립 리뷰 결과를 `llm-wiki/validation-log.md`에 추가
3. 필요 시 CLI 실행 예시 추가

## 직전 완료

- `src/classification/index.ts` 구현 완료
- `src/consultation/index.ts` 구현 완료
- `src/estimate/index.ts` 구현 완료
- `src/risk/index.ts` 구현 완료
- `src/messaging/index.ts` 구현 완료
- `src/approval/index.ts` 구현 완료
- `src/prompt-generation/index.ts` 구현 완료
- `src/validation/index.ts` 구현 완료
- `src/delivery-package/index.ts` 구현 완료
- `README.md` 생성 완료
- `data/samples/sample-02.txt`, `sample-03.txt` 추가 완료
- `tests/e2e.test.mjs` 추가 완료
- intake 멀티라인 파싱 수정 완료
- analysis 컨텍스트 확장 완료
- `corepack pnpm typecheck` 통과
- `corepack pnpm test` 통과 (9 tests)

## 주의사항
- Plan Mode 쓰지 말 것 (스코프 명확하면 바로 실행)
- TodoWrite는 5단계 이상 복잡할 때만
- 비개발자 눈높이로 설명
- 스택: Node.js + TypeScript + pnpm
- intake + analysis 검증은 Codex에게 요청 (agent-registry.md 참조)
