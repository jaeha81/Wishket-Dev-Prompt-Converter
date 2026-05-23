/**
 * prompt-generation — Claude 구현 프롬프트와 Codex Goal 검증 프롬프트 생성.
 */

import type {
  AnalysisResult,
  AutomationSpec,
  Classification,
  Estimate,
  RiskAssessment,
} from '../types/index.js';

export interface GeneratedPrompts {
  inquiry_id: string;
  claude_implementation_prompt: string;
  codex_goal_validation_prompt: string;
}

function requirementLines(analysis: AnalysisResult): string {
  return analysis.requirements.map(req => `- [${req.category}] ${req.text}`).join('\n');
}

function specBlock(spec?: AutomationSpec): string {
  if (!spec) return '- 아직 자동화 사양서 없음. 구현 전 사양서를 먼저 작성할 것.';
  return [
    `목적: ${spec.purpose}`,
    `입력: ${spec.io.inputs.join(', ') || '미정'}`,
    `출력: ${spec.io.outputs.join(', ') || '미정'}`,
    `검증 기준:\n${spec.validation_criteria.map(item => `- ${item}`).join('\n')}`,
    `제외 범위:\n${spec.out_of_scope.map(item => `- ${item}`).join('\n')}`,
  ].join('\n');
}

export function generatePrompts(
  analysis: AnalysisResult,
  classification: Classification,
  estimate: Estimate,
  risk: RiskAssessment,
  spec?: AutomationSpec,
): GeneratedPrompts {
  const sharedContext = [
    `Inquiry ID: ${analysis.inquiry_id}`,
    `작업 유형: ${classification.work_types.join(', ')}`,
    `난이도: ${classification.difficulty}`,
    `복잡도: ${classification.complexity}`,
    `견적 범위: ${estimate.cost.low}~${estimate.cost.high} ${estimate.cost.currency}`,
    `리스크 수준: ${risk.overall_level}`,
    '',
    '요구사항:',
    requirementLines(analysis),
    '',
    '자동화 사양:',
    specBlock(spec),
  ].join('\n');

  return {
    inquiry_id: analysis.inquiry_id,
    claude_implementation_prompt: [
      '너는 Wishket Dev Prompt Converter 구현 담당 Claude Code다.',
      '',
      '목표:',
      '- 아래 컨텍스트를 바탕으로 MVP 범위 안에서 구현 가능한 자동화 사양과 코드를 작성한다.',
      '- 고객 메시지 발송, 계약 확정, 자동 지원은 절대 수행하지 않는다.',
      '',
      sharedContext,
      '',
      '종료 조건:',
      '- TypeScript 타입 체크 통과',
      '- 핵심 흐름 테스트 통과',
      '- 고객 발송 전 approval 게이트 유지',
    ].join('\n'),
    codex_goal_validation_prompt: [
      '/goal',
      '',
      '목표:',
      'Wishket 구현 산출물이 MVP 안전 원칙과 타입 안전성을 만족하는지 검증한다.',
      '',
      sharedContext,
      '',
      '검증 체크리스트:',
      '- [ ] 고객 메시지와 내부 판단이 분리되어 있다.',
      '- [ ] 승인 없는 발송 경로가 없다.',
      '- [ ] 견적/일정은 확정 표현이 아니라 범위/전제 조건으로 표시된다.',
      '- [ ] 개인정보/약관/스크래핑 리스크가 누락되지 않았다.',
      '- [ ] typecheck와 테스트가 통과한다.',
      '- [ ] 수정 필요 항목은 review-issues.md에 기록 가능하다.',
    ].join('\n'),
  };
}
