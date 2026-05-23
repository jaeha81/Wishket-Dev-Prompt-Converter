/**
 * estimate — 분석/분류 결과에서 견적 범위와 일정 전제를 산정.
 *
 * 확정 견적이 아니라 상담용 초안이다. 고객 전달 전 사람 검토가 필요하다.
 */

import type {
  AnalysisResult,
  Classification,
  Difficulty,
  Estimate,
  ScheduleEstimate,
  WorkType,
} from '../types/index.js';

const BASE_COST_BY_DIFFICULTY: Record<Difficulty, number> = {
  low: 500_000,
  medium: 1_500_000,
  high: 3_500_000,
};

const WORK_TYPE_MULTIPLIER: Record<WorkType, number> = {
  automation: 1.0,
  integration: 1.25,
  scraping: 1.3,
  bot: 1.15,
  dashboard: 1.3,
  data_pipeline: 1.2,
  api: 1.35,
  other: 1.0,
};

const SCHEDULE_BY_DIFFICULTY: Record<Difficulty, ScheduleEstimate> = {
  low: { min_days: 3, expected_days: 7, max_days: 10 },
  medium: { min_days: 7, expected_days: 14, max_days: 21 },
  high: { min_days: 14, expected_days: 28, max_days: 45 },
};

function roundToTenThousand(value: number): number {
  return Math.round(value / 10_000) * 10_000;
}

function combinedMultiplier(classification: Classification): number {
  const typeMultiplier = classification.work_types.reduce(
    (total, type) => total + (WORK_TYPE_MULTIPLIER[type] - 1),
    1,
  );
  const complexityMultiplier = classification.complexity === 'complex'
    ? 1.35
    : classification.complexity === 'moderate'
      ? 1.15
      : 1;
  return typeMultiplier * complexityMultiplier;
}

function buildAssumptions(analysis: AnalysisResult, classification: Classification): string[] {
  const assumptions = [
    '본 견적은 초기 상담용 범위이며 계약/확정 견적이 아닙니다.',
    '고객 메시지 발송 전 사람 검토와 승인이 필요합니다.',
    `작업 유형은 ${classification.work_types.join(', ')} 기준입니다.`,
  ];

  if (analysis.missing_items.length > 0) {
    assumptions.push('누락 항목 답변 후 비용과 일정이 조정될 수 있습니다.');
  }
  if (analysis.ambiguous_items.length > 0) {
    assumptions.push('모호한 요구사항은 구현 전 구체화가 필요합니다.');
  }

  return assumptions;
}

export function estimateInquiry(
  analysis: AnalysisResult,
  classification: Classification,
): Estimate {
  const base = BASE_COST_BY_DIFFICULTY[classification.difficulty];
  const mid = roundToTenThousand(base * combinedMultiplier(classification));
  const low = roundToTenThousand(mid * 0.75);
  const high = roundToTenThousand(mid * 1.45);
  const schedule = SCHEDULE_BY_DIFFICULTY[classification.difficulty];

  return {
    inquiry_id: analysis.inquiry_id,
    cost: {
      low,
      mid,
      high,
      currency: 'KRW',
    },
    schedule,
    assumptions: buildAssumptions(analysis, classification),
  };
}
