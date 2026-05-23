/**
 * messaging — 상담 초안을 채널별 복사 가능 메시지로 변환.
 *
 * 실제 발송은 하지 않는다. ApprovalRecord가 approved일 때만 외부 전달 가능하다.
 */

import type {
  ChannelMessage,
  ConsultationMessage,
  Estimate,
  MessageChannel,
  MessageTone,
  RiskAssessment,
} from '../types/index.js';

function formatKrw(value: number): string {
  return `${Math.round(value / 10_000).toLocaleString('ko-KR')}만원`;
}

function estimateSummary(estimate?: Estimate): string {
  if (!estimate) return '';
  return [
    '',
    '[초기 견적 범위]',
    `- 비용: ${formatKrw(estimate.cost.low)} ~ ${formatKrw(estimate.cost.high)} (중간값 ${formatKrw(estimate.cost.mid)})`,
    `- 일정: ${estimate.schedule.min_days}~${estimate.schedule.max_days}일 예상`,
    '- 전제: 확정 견적이 아니며 답변 확인 후 조정됩니다.',
  ].join('\n');
}

function riskSummary(risk?: RiskAssessment): string {
  if (!risk || risk.items.length === 0) return '';
  return [
    '',
    '[확인 필요 리스크]',
    `- 전체 수준: ${risk.overall_level}`,
    ...risk.items.slice(0, 3).map(item => `- ${item.description}`),
  ].join('\n');
}

function channelPrefix(channel: MessageChannel): string {
  if (channel === 'email') return '안녕하세요.\n\n';
  if (channel === 'telegram') return '[위시켓 의뢰 검토]\n';
  return '';
}

function subjectFor(channel: MessageChannel): string | undefined {
  if (channel === 'email') return '위시켓 의뢰 내용 초기 검토 및 확인 요청';
  return undefined;
}

function toneFor(channel: MessageChannel): MessageTone {
  if (channel === 'telegram') return 'concise';
  if (channel === 'email') return 'formal';
  return 'friendly';
}

export function createChannelMessage(
  consultation: ConsultationMessage,
  channel: MessageChannel,
  estimate?: Estimate,
  risk?: RiskAssessment,
): ChannelMessage {
  const body = [
    channelPrefix(channel),
    consultation.draft_body,
    estimateSummary(estimate),
    riskSummary(risk),
    '',
    '※ 본 메시지는 초안입니다. 발송 전 사람 승인 후 사용하세요.',
  ].join('\n').trim();

  return {
    inquiry_id: consultation.inquiry_id,
    channel,
    subject: subjectFor(channel),
    body,
    tone: toneFor(channel),
  };
}
