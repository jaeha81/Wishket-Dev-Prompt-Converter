/** 위시켓 의뢰서 입력 스키마 (개발.MD §5). */

export type ConsultationStatus = 'pending' | 'in_progress' | 'completed';
export type DevStatus = 'pending' | 'in_progress' | 'review' | 'completed';
export type ValidationStatus = 'pending' | 'pass' | 'fail';
export type DeliveryStatus = 'pending' | 'ready' | 'delivered';

export interface InquiryInput {
  project_title: string;
  description: string;
  budget: string;
  expected_duration: string;
  required_skills: string[];
  dev_scope: string;
  deliverables: string;
  client_requirements: string;
  support_conditions: string;
  schedule_conditions: string;
  risks: string;
  attachments: string[];
  contact_channels: string[];
  internal_memo: string;
  consultation_status: ConsultationStatus;
  dev_status: DevStatus;
  validation_status: ValidationStatus;
  delivery_status: DeliveryStatus;
}
