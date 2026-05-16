/** 사전 상담 메시지 초안 스키마. */

export interface ConsultationQuestion {
  id: string;
  question: string;
  reason: string;
}

export interface ConsultationMessage {
  inquiry_id: string;
  questions: ConsultationQuestion[];
  estimate_rationale: string;
  schedule_assumptions: string[];
  draft_body: string;
}
