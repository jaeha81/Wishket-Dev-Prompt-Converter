/**
 * consultation — 분석/분류 결과에서 상담 질문과 고객 응대 초안을 생성.
 *
 * 고객 발송 전 사람 승인 필수. 이 모듈은 초안만 만든다.
 */

import type {
  AnalysisResult,
  Classification,
  ConsultationMessage,
  ConsultationQuestion,
  Difficulty,
  WorkType,
} from '../types/index.js';

const FIELD_LABELS: Record<string, string> = {
  project_title: '프로젝트 제목',
  description: '프로젝트 설명',
  budget: '예산',
  expected_duration: '희망 일정',
  required_skills: '필요 기술',
  dev_scope: '개발 범위',
  deliverables: '산출물',
  client_requirements: '요구사항',
  support_conditions: '유지보수/지원 조건',
  schedule_conditions: '일정 조건',
  risks: '리스크',
};

const ESTIMATE_NOTES: Record<WorkType, string> = {
  automation: '반복 업무 범위와 예외 케이스 수가 견적에 큰 영향을 줍니다.',
  integration: '연동 대상 API 문서, 인증 방식, 호출 제한 확인이 필요합니다.',
  scraping: '대상 사이트 약관, 접근 허용 범위, 구조 변경 가능성 확인이 필요합니다.',
  bot: '사용 채널, 응답 흐름, 관리자 알림 범위 확정이 필요합니다.',
  dashboard: '표시 지표, 권한, 데이터 갱신 주기 확정이 필요합니다.',
  data_pipeline: '입력 데이터 형식, 정제 규칙, 출력 포맷 확정이 필요합니다.',
  api: '엔드포인트 범위, 인증, 데이터 모델 확정이 필요합니다.',
  other: '요구사항 범위를 먼저 구체화한 뒤 견적 산정이 필요합니다.',
};

const SCHEDULE_ASSUMPTIONS: Record<Difficulty, string[]> = {
  low: ['요구사항 확정 후 짧은 단위 구현과 검수로 진행 가능합니다.'],
  medium: ['핵심 기능을 먼저 구현하고, 예외 케이스는 2차 범위로 분리하는 편이 안전합니다.'],
  high: ['기획 확정, 기술 검증, 보안/운영 검토를 별도 단계로 잡아야 합니다.'],
};

function questionId(index: number): string {
  return `Q-${String(index + 1).padStart(3, '0')}`;
}

function buildQuestions(analysis: AnalysisResult): ConsultationQuestion[] {
  const questions: ConsultationQuestion[] = [];

  for (const item of analysis.missing_items) {
    const label = FIELD_LABELS[item.field] ?? item.field;
    questions.push({
      id: questionId(questions.length),
      question: `${label}을(를) 어느 정도로 생각하고 계신가요?`,
      reason: item.reason,
    });
  }

  for (const item of analysis.ambiguous_items) {
    const label = FIELD_LABELS[item.field] ?? item.field;
    questions.push({
      id: questionId(questions.length),
      question: `${label}의 "${item.text}" 부분을 더 구체적으로 알려주실 수 있을까요?`,
      reason: item.clarification_needed,
    });
  }

  return questions;
}

function buildEstimateRationale(classification: Classification): string {
  const notes = classification.work_types.map(type => `- ${ESTIMATE_NOTES[type]}`);
  return [
    `작업 유형: ${classification.work_types.join(', ')}`,
    `난이도: ${classification.difficulty} / 복잡도: ${classification.complexity}`,
    ...notes,
  ].join('\n');
}

function buildDraftBody(questions: ConsultationQuestion[], classification: Classification): string {
  const questionLines = questions.length > 0
    ? questions.map(question => `- ${question.question}`).join('\n')
    : '- 현재 입력 기준으로 큰 누락 항목은 보이지 않습니다. 세부 범위만 확인하면 됩니다.';

  return [
    '안녕하세요. 전달주신 의뢰 내용을 기준으로 초기 검토했습니다.',
    '',
    `현재 작업 유형은 ${classification.work_types.join(', ')} 쪽으로 보이며, 난이도는 ${classification.difficulty}로 판단됩니다.`,
    '',
    '정확한 견적과 일정을 잡기 위해 아래 내용을 확인 부탁드립니다.',
    questionLines,
    '',
    '확인 후 기능 범위, 일정 전제, 산출물 기준을 나누어 제안드리겠습니다.',
  ].join('\n');
}

export function createConsultationMessage(
  analysis: AnalysisResult,
  classification: Classification,
): ConsultationMessage {
  const questions = buildQuestions(analysis);

  return {
    inquiry_id: analysis.inquiry_id,
    questions,
    estimate_rationale: buildEstimateRationale(classification),
    schedule_assumptions: SCHEDULE_ASSUMPTIONS[classification.difficulty],
    draft_body: buildDraftBody(questions, classification),
  };
}
