/**
 * intake — 위시켓 의뢰서 원문 텍스트 → InquiryInput 구조체로 정규화.
 *
 * 입력: 위시켓에서 복사한 날(raw) 텍스트
 * 출력: src/types/inquiry.ts의 InquiryInput 양식
 */

import type { InquiryInput } from '../types/index.js';

const FIELD_LABEL_PATTERNS = [
  '프로젝트\\s*제목', '제목', 'title',
  '프로젝트\\s*설명', '설명', '내용', 'description',
  '예산', '금액', 'budget',
  '기간', '납기', '일정', '개발\\s*기간', 'duration', 'deadline',
  '기술\\s*스택', '사용\\s*기술', '필요\\s*기술', 'skills', 'stack',
  '개발\\s*범위', '작업\\s*범위', '범위', 'scope',
  '산출물', '결과물', '납품\\s*물', 'deliverables',
  '요구\\s*사항', '클라이언트\\s*요청', '고객\\s*요구', 'requirements',
  '유지\\s*보수', '지원\\s*조건', 'support',
  '일정\\s*조건', '마감\\s*조건', 'schedule',
  '리스크', '위험', '주의\\s*사항', 'risks',
  '첨부\\s*파일', '파일', 'attachments',
  '연락\\s*채널', '연락처', '연락\\s*방법', 'contact',
  '내부\\s*메모', '메모', 'memo',
] as const;

/** 줄바꿈·탭·연속 공백 정리 */
function normalizeWhitespace(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/ {2,}/g, ' ')
    .trim();
}

/**
 * "레이블: 값" 패턴에서 값 추출.
 * patterns: 레이블 후보 목록 (정규식 문자열, 대소문자 무시)
 */
function extractField(text: string, patterns: string[]): string {
  if (patterns.length === 0) return '';

  const labelPattern = patterns.join('|');
  const nextLabelPattern = FIELD_LABEL_PATTERNS.join('|');
  const regex = new RegExp(
    `(?:^|\\n)[ \\t]*(?:${labelPattern})[ \\t]*[:\\：][ \\t]*([\\s\\S]*?)(?=\\n[ \\t]*(?:${nextLabelPattern})[ \\t]*[:\\：]|$)`,
    'i',
  );
  const match = text.match(regex);
  return match?.[1]?.trim() ?? '';
}

/**
 * 쉼표·슬래시·줄바꿈으로 구분된 목록 추출 → string[]
 */
function extractList(text: string, patterns: string[]): string[] {
  const raw = extractField(text, patterns);
  if (!raw) return [];
  return raw
    .split(/[,，、/\n]/)
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * 원문 텍스트를 InquiryInput 양식으로 변환.
 *
 * - 인식한 레이블이 없으면 해당 필드는 빈 문자열/빈 배열.
 * - status 필드는 항상 'pending' (새 의뢰이므로).
 */
export function parseInquiry(rawText: string): InquiryInput {
  const text = normalizeWhitespace(rawText);

  return {
    project_title:       extractField(text, ['프로젝트\\s*제목', '제목', 'title']),
    description:         extractField(text, ['프로젝트\\s*설명', '설명', '내용', 'description']),
    budget:              extractField(text, ['예산', '금액', 'budget']),
    expected_duration:   extractField(text, ['기간', '납기', '일정', '개발\\s*기간', 'duration', 'deadline']),
    required_skills:     extractList(text,  ['기술\\s*스택', '사용\\s*기술', '필요\\s*기술', 'skills', 'stack']),
    dev_scope:           extractField(text, ['개발\\s*범위', '작업\\s*범위', '범위', 'scope']),
    deliverables:        extractField(text, ['산출물', '결과물', '납품\\s*물', 'deliverables']),
    client_requirements: extractField(text, ['요구\\s*사항', '클라이언트\\s*요청', '고객\\s*요구', 'requirements']),
    support_conditions:  extractField(text, ['유지\\s*보수', '지원\\s*조건', 'support']),
    schedule_conditions: extractField(text, ['일정\\s*조건', '마감\\s*조건', 'schedule']),
    risks:               extractField(text, ['리스크', '위험', '주의\\s*사항', 'risks']),
    attachments:         extractList(text,  ['첨부\\s*파일', '파일', 'attachments']),
    contact_channels:    extractList(text,  ['연락\\s*채널', '연락처', '연락\\s*방법', 'contact']),
    internal_memo:       extractField(text, ['내부\\s*메모', '메모', 'memo']),
    consultation_status: 'pending',
    dev_status:          'pending',
    validation_status:   'pending',
    delivery_status:     'pending',
  };
}
