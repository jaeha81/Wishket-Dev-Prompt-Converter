/**
 * approval — 고객 메시지 발송 전 사람 승인 상태 관리.
 */

import type {
  ApprovalRecord,
  ApprovalState,
  ChannelMessage,
} from '../types/index.js';

function messageId(message: ChannelMessage): string {
  return `${message.channel}-${message.inquiry_id}`;
}

export function createApprovalRequest(message: ChannelMessage): ApprovalRecord {
  return {
    message_id: messageId(message),
    inquiry_id: message.inquiry_id,
    state: 'pending',
    approver: '',
    decided_at: '',
    comment: '발송 전 사람 승인 대기',
  };
}

export function decideApproval(
  record: ApprovalRecord,
  state: Exclude<ApprovalState, 'pending'>,
  approver: string,
  comment?: string,
): ApprovalRecord {
  return {
    ...record,
    state,
    approver,
    decided_at: new Date().toISOString(),
    comment,
  };
}

export function canSend(record: ApprovalRecord): boolean {
  return record.state === 'approved' && Boolean(record.approver && record.decided_at);
}
