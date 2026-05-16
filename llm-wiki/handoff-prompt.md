# handoff-prompt — 다음 세션 시작 명령문

> 다음 세션을 시작할 때 이 파일을 읽고 아래 명령문을 복사해서 사용한다.

---

## 다음 세션 시작 명령문

```
llm-wiki/current-state.md 읽고 Wishket Phase 2 (intake + analysis 모듈) 케이브맨 실행
```

---

## Phase 2에서 할 일 (개발.MD §16 기준)

1. `src/intake/index.ts` — 의뢰서 텍스트 받아서 정리하는 모듈
2. `src/analysis/index.ts` — 정리된 텍스트에서 요구사항 뽑고 빠진 것 찾는 모듈
3. `llm-wiki/` 나머지 5개 문서 콘텐츠 작성 (project-overview, agent-registry, decision-log, validation-log, handoff-prompt 고도화)

## 주의사항
- Plan Mode 쓰지 말 것 (스코프 명확하면 바로 실행)
- TodoWrite는 5단계 이상 복잡할 때만
- 비개발자 눈높이로 설명
- 스택: Node.js + TypeScript + pnpm
