/**
 * validation — Codex 검증 요청/결과 기록 Adapter.
 *
 * 실제 Codex 실행은 외부 AgentBus 또는 CLI가 담당한다. 이 모듈은 안전한 기록 구조만 만든다.
 */

import type { GeneratedPrompts } from '../prompt-generation/index.js';

export type ValidationStatus = 'pending' | 'pass' | 'fail';

export interface ValidationRequest {
  inquiry_id: string;
  target: 'codex';
  status: ValidationStatus;
  prompt: string;
  created_at: string;
}

export interface ValidationResult {
  inquiry_id: string;
  status: Exclude<ValidationStatus, 'pending'>;
  reviewer: 'codex' | 'human';
  summary: string;
  issues: string[];
  reviewed_at: string;
}

export function createCodexValidationRequest(prompts: GeneratedPrompts): ValidationRequest {
  return {
    inquiry_id: prompts.inquiry_id,
    target: 'codex',
    status: 'pending',
    prompt: prompts.codex_goal_validation_prompt,
    created_at: new Date().toISOString(),
  };
}

export function recordValidationResult(
  request: ValidationRequest,
  issues: string[],
  summary = '',
): ValidationResult {
  return {
    inquiry_id: request.inquiry_id,
    status: issues.length > 0 ? 'fail' : 'pass',
    reviewer: 'codex',
    summary: summary || (issues.length > 0 ? '수정 필요 항목 있음' : '검증 통과'),
    issues,
    reviewed_at: new Date().toISOString(),
  };
}
