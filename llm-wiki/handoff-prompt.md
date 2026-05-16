# handoff-prompt — 다음 세션 시작 명령문

> 다음 세션을 시작할 때 이 파일을 읽고 아래 명령문을 복사해서 사용한다.

---

## 다음 세션 시작 명령문

```
llm-wiki/current-state.md 읽고 Wishket Phase 3 (classification + consultation 모듈) 케이브맨 실행
```

---

## Phase 3에서 할 일

1. `src/classification/index.ts` — 작업 유형(자동화/크롤링/봇 등) + 난이도 분류
2. `src/consultation/index.ts` — 사전 상담 메시지 초안 생성 (누락 항목 질문 포함)
3. `tests/intake.test.ts` — intake 모듈 단위 테스트 (샘플 데이터 기반)
4. `tests/analysis.test.ts` — analysis 모듈 단위 테스트
5. `data/samples/sample-01.txt` — 실제 위시켓 의뢰서 형식 샘플

## 주의사항
- Plan Mode 쓰지 말 것 (스코프 명확하면 바로 실행)
- TodoWrite는 5단계 이상 복잡할 때만
- 비개발자 눈높이로 설명
- 스택: Node.js + TypeScript + pnpm
- intake + analysis 검증은 Codex에게 요청 (agent-registry.md 참조)
