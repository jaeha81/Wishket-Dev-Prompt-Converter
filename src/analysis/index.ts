/**
 * analysis — InquiryInput에서 요구사항 추출 + 누락·모호 항목 탐지.
 *
 * 입력: src/intake에서 정규화된 InquiryInput
 * 출력: AnalysisResult (요구사항 목록, 누락 목록, 모호 목록, 신뢰도 0~1)
 */

import { randomUUID } from 'node:crypto';
import type { InquiryInput } from '../types/index.js';
import type {
  AnalysisResult,
  ExtractedRequirement,
  MissingItem,
  AmbiguousItem,
} from '../types/index.js';

/** 빠지면 견적·상담이 불가능한 필수 필드 */
const MANDATORY_FIELDS: ReadonlyArray<keyof InquiryInput> = [
  'project_title',
  'description',
  'budget',
  'expected_duration',
  'dev_scope',
  'deliverables',
];

/** 모호한 표현 패턴 → 질문 문구 */
const AMBIGUOUS_PATTERNS: ReadonlyArray<{ pattern: RegExp; clarification: string }> = [
  { pattern: /약\s*\d/,              clarification: '정확한 수치나 범위를 명시해주세요' },
  { pattern: /\d+\s*정도/,           clarification: '정확한 수치나 범위를 명시해주세요' },
  { pattern: /나중에|추후/,          clarification: '구체적인 시점을 지정해주세요' },
  { pattern: /기타|등등|etc\.?/i,    clarification: '구체적인 항목을 나열해주세요' },
  { pattern: /필요\s*시|필요하면/,   clarification: '조건 및 구체적 요건을 명시해주세요' },
  { pattern: /협의|논의|상의/,       clarification: '기준값 또는 범위를 먼저 제시해주세요' },
  { pattern: /간단한|쉬운|빠른/,     clarification: '작업량·복잡도 기준을 구체화해주세요' },
];

/** 문단/문장을 5자 이상 청크로 분리 */
function splitSentences(text: string): string[] {
  return text
    .split(/[.\n]/)
    .map(s => s.trim())
    .filter(s => s.length > 5);
}

// ─────────────────────────────────────────────
// 요구사항 추출
// ─────────────────────────────────────────────

function extractRequirements(inquiry: InquiryInput): ExtractedRequirement[] {
  const results: ExtractedRequirement[] = [];
  let seq = 1;
  const id = () => `REQ-${String(seq++).padStart(3, '0')}`;
  const add = (category: ExtractedRequirement['category'], text: string) => {
    const normalized = text.trim();
    if (normalized) results.push({ id: id(), category, text: normalized });
  };

  // project_title + description + client_requirements + deliverables → 기능 요구사항
  if (inquiry.project_title.trim()) add('functional', `프로젝트 제목: ${inquiry.project_title}`);
  for (const text of [inquiry.description, inquiry.client_requirements]) {
    for (const sentence of splitSentences(text)) {
      add('functional', sentence);
    }
  }
  if (inquiry.deliverables.trim()) add('functional', `산출물: ${inquiry.deliverables}`);

  // scope + skills + budget + schedule + risks → 제약 조건
  add('constraint', inquiry.dev_scope);
  if (inquiry.required_skills.length > 0) add('constraint', `필요 기술: ${inquiry.required_skills.join(', ')}`);
  if (inquiry.budget.trim()) add('constraint', `예산: ${inquiry.budget}`);
  if (inquiry.expected_duration.trim()) add('constraint', `희망 일정: ${inquiry.expected_duration}`);
  if (inquiry.risks.trim()) add('constraint', `리스크: ${inquiry.risks}`);

  // support_conditions, schedule_conditions → 비기능 요구사항
  for (const text of [inquiry.support_conditions, inquiry.schedule_conditions]) {
    add('non_functional', text);
  }

  return results;
}

// ─────────────────────────────────────────────
// 누락 항목 탐지
// ─────────────────────────────────────────────

function detectMissingItems(inquiry: InquiryInput): MissingItem[] {
  const missing: MissingItem[] = [];

  for (const field of MANDATORY_FIELDS) {
    const value = inquiry[field];
    const empty =
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0);

    if (empty) {
      missing.push({ field, reason: `필수 항목 "${field}"이(가) 비어 있습니다` });
    }
  }

  // required_skills: 없으면 기술 견적 산정 불가 경고
  if (inquiry.required_skills.length === 0) {
    missing.push({
      field: 'required_skills',
      reason: '기술 스택이 없으면 난이도·기간 추정이 어렵습니다',
    });
  }

  return missing;
}

// ─────────────────────────────────────────────
// 모호 항목 탐지
// ─────────────────────────────────────────────

function detectAmbiguousItems(inquiry: InquiryInput): AmbiguousItem[] {
  const ambiguous: AmbiguousItem[] = [];

  const FIELDS_TO_CHECK: ReadonlyArray<keyof InquiryInput> = [
    'description',
    'budget',
    'expected_duration',
    'client_requirements',
    'dev_scope',
    'deliverables',
  ];

  for (const field of FIELDS_TO_CHECK) {
    const value = inquiry[field];
    if (typeof value !== 'string' || !value.trim()) continue;

    for (const { pattern, clarification } of AMBIGUOUS_PATTERNS) {
      if (pattern.test(value)) {
        ambiguous.push({
          field,
          text: value.slice(0, 100),
          clarification_needed: clarification,
        });
        break; // 필드당 첫 번째 모호 패턴만 기록
      }
    }
  }

  return ambiguous;
}

// ─────────────────────────────────────────────
// 신뢰도 산출 (0.0 ~ 1.0)
// ─────────────────────────────────────────────

function calcConfidence(missing: MissingItem[], ambiguous: AmbiguousItem[]): number {
  // 필수 필드 7개 기준 (MANDATORY_FIELDS 6 + required_skills 1)
  const total = MANDATORY_FIELDS.length + 1;
  const penalty = (missing.length + ambiguous.length * 0.5) / total;
  return Math.max(0, Math.round((1 - penalty) * 100) / 100);
}

// ─────────────────────────────────────────────
// 메인 진입점
// ─────────────────────────────────────────────

/**
 * 의뢰서를 분석해 요구사항·누락·모호 항목을 반환한다.
 * inquiry_id는 호출마다 새로 생성되는 UUID.
 */
export function analyzeInquiry(inquiry: InquiryInput): AnalysisResult {
  const requirements  = extractRequirements(inquiry);
  const missing_items = detectMissingItems(inquiry);
  const ambiguous_items = detectAmbiguousItems(inquiry);
  const confidence    = calcConfidence(missing_items, ambiguous_items);

  return {
    inquiry_id: randomUUID(),
    requirements,
    missing_items,
    ambiguous_items,
    confidence,
  };
}
