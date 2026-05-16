/** 채널별 메시지 출력 스키마. */

export type MessageChannel = 'telegram' | 'email' | 'wishket';
export type MessageTone = 'formal' | 'friendly' | 'concise';

export interface ChannelMessage {
  inquiry_id: string;
  channel: MessageChannel;
  subject?: string;
  body: string;
  tone: MessageTone;
  attachments?: string[];
}
