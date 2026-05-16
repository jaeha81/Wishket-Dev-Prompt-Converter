/** 승인 상태 스키마 (고객 메시지 송신 전 사람 승인). */

export type ApprovalState = 'pending' | 'approved' | 'rejected' | 'revision_requested';

export interface ApprovalRecord {
  message_id: string;
  inquiry_id: string;
  state: ApprovalState;
  approver: string;
  decided_at: string;
  comment?: string;
}
