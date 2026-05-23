/**
 * delivery-package — 검증/승인된 산출물을 고객 제공 패키지 초안으로 구성.
 */

import type {
  ApprovalRecord,
  AutomationSpec,
  ChannelMessage,
  Estimate,
  RiskAssessment,
} from '../types/index.js';
import { canSend } from '../approval/index.js';
import type { ValidationResult } from '../validation/index.js';

export interface DeliveryPackage {
  inquiry_id: string;
  ready: boolean;
  customer_message: string;
  included_items: string[];
  internal_checklist: string[];
  warnings: string[];
}

function formatCost(estimate: Estimate): string {
  return `${estimate.cost.low.toLocaleString('ko-KR')}~${estimate.cost.high.toLocaleString('ko-KR')} ${estimate.cost.currency}`;
}

export function createDeliveryPackage(
  message: ChannelMessage,
  approval: ApprovalRecord,
  validation: ValidationResult,
  estimate: Estimate,
  risk: RiskAssessment,
  spec?: AutomationSpec,
): DeliveryPackage {
  const warnings: string[] = [];

  if (!canSend(approval)) warnings.push('고객 메시지 발송 승인 미완료');
  if (validation.status !== 'pass') warnings.push('Codex 검증 미통과');
  if (risk.overall_level === 'high' || risk.overall_level === 'critical') {
    warnings.push(`리스크 수준 ${risk.overall_level}: 추가 검토 필요`);
  }

  const includedItems = [
    '고객 응대 메시지 초안',
    `견적 범위: ${formatCost(estimate)}`,
    `예상 일정: ${estimate.schedule.min_days}~${estimate.schedule.max_days}일`,
    '리스크 및 전제 조건',
  ];
  if (spec) includedItems.push('자동화 개발 사양서');

  return {
    inquiry_id: message.inquiry_id,
    ready: warnings.length === 0,
    customer_message: message.body,
    included_items: includedItems,
    internal_checklist: [
      '고객 메시지와 내부 판단 분리 확인',
      '견적/일정 확정 표현 없음 확인',
      '승인 기록 approved 확인',
      'Codex 검증 pass 확인',
      '개인정보/토큰 노출 없음 확인',
    ],
    warnings,
  };
}
