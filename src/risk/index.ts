/**
 * risk — 납기·보안·약관·개인정보·요구사항 리스크 평가.
 */

import type {
  AnalysisResult,
  Classification,
  RiskAssessment,
  RiskImpact,
  RiskItem,
  RiskLikelihood,
} from '../types/index.js';

const IMPACT_RANK: Record<RiskImpact, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

function nextId(items: RiskItem[]): string {
  return `RISK-${String(items.length + 1).padStart(3, '0')}`;
}

function addRisk(
  items: RiskItem[],
  description: string,
  impact: RiskImpact,
  likelihood: RiskLikelihood,
  mitigation: string,
) {
  items.push({
    id: nextId(items),
    description,
    impact,
    likelihood,
    mitigation,
  });
}

function requirementText(analysis: AnalysisResult): string {
  return analysis.requirements.map(req => req.text).join('\n').toLowerCase();
}

function overallLevel(items: RiskItem[]): RiskImpact {
  if (items.length === 0) return 'low';
  return items.reduce<RiskImpact>((max, item) => (
    IMPACT_RANK[item.impact] > IMPACT_RANK[max] ? item.impact : max
  ), 'low');
}

export function assessRisk(
  analysis: AnalysisResult,
  classification: Classification,
): RiskAssessment {
  const items: RiskItem[] = [];
  const text = requirementText(analysis);

  if (analysis.missing_items.length > 0) {
    addRisk(
      items,
      '필수 정보 누락으로 견적/납기 오판 가능성이 있습니다.',
      'medium',
      'likely',
      '누락 항목을 상담 질문으로 먼저 확인합니다.',
    );
  }

  if (analysis.ambiguous_items.length > 0) {
    addRisk(
      items,
      '모호한 표현이 있어 구현 범위가 커질 수 있습니다.',
      'medium',
      'possible',
      '모호 항목을 범위/제외 항목으로 분리합니다.',
    );
  }

  if (classification.work_types.includes('scraping')) {
    addRisk(
      items,
      '크롤링/스크래핑은 대상 서비스 약관과 접근 제한을 확인해야 합니다.',
      'high',
      'possible',
      '공식 API 또는 사용자 제공 데이터 우선으로 전환합니다.',
    );
  }

  if (/개인정보|연락처|이메일|전화번호|주민|계정|비밀번호/.test(text)) {
    addRisk(
      items,
      '개인정보 또는 계정 정보 처리 가능성이 있습니다.',
      'high',
      'possible',
      '최소 저장, 마스킹, 환경변수/비밀 저장소 사용 원칙을 적용합니다.',
    );
  }

  if (/자동\s*발송|대량\s*발송|스팸|무단/.test(text)) {
    addRisk(
      items,
      '승인 없는 자동 발송 또는 스팸성 사용 위험이 있습니다.',
      'critical',
      'possible',
      'MVP에서는 자동 발송을 제외하고 승인 후 복사 가능한 메시지만 제공합니다.',
    );
  }

  if (classification.difficulty === 'high') {
    addRisk(
      items,
      '난이도 높음으로 일정 지연 가능성이 있습니다.',
      'medium',
      'possible',
      '기술 검증과 핵심 기능 우선 구현 단계를 분리합니다.',
    );
  }

  return {
    inquiry_id: analysis.inquiry_id,
    items,
    overall_level: overallLevel(items),
  };
}
