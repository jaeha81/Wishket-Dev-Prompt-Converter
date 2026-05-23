# Claude Implementation Prompt Template

## Goal

Implement the approved MVP scope only.

## Must Keep

- No automatic customer sending.
- No fixed price or deadline promise without human approval.
- Keep customer-facing message and internal reasoning separate.
- Run `corepack pnpm typecheck` and `corepack pnpm test`.

## Inputs

- AnalysisResult
- Classification
- Estimate
- RiskAssessment
- ApprovalRecord

## Exit

- Typecheck pass
- Tests pass
- Approval gate preserved
