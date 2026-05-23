/**
 * classification — AnalysisResult를 작업 유형·난이도·복잡도로 분류.
 *
 * MVP는 규칙 기반 키워드 분류만 사용한다. LLM 판단은 후속 단계에서 Adapter로 분리한다.
 */

import type {
  AnalysisResult,
  Classification,
  Complexity,
  Difficulty,
  WorkType,
} from '../types/index.js';

const WORK_TYPE_KEYWORDS: Record<WorkType, string[]> = {
  automation: ['자동화', '반복', '업무 자동화', '매크로', '스크립트', 'rpa'],
  integration: ['연동', 'api 연동', 'webhook', 'make', 'zapier', 'notion', 'google', 'slack'],
  scraping: ['크롤링', '스크래핑', '수집', 'crawling', 'scraping', '파싱'],
  bot: ['봇', '챗봇', 'telegram', 'discord', '카카오', '알림'],
  dashboard: ['대시보드', '관리자', '통계', '시각화', '차트', '리포트'],
  data_pipeline: ['데이터', '엑셀', 'csv', '정제', '변환', '파이프라인', 'etl'],
  api: ['api', '서버', 'backend', '백엔드', 'endpoint', 'db', 'database'],
  other: [],
};

const HIGH_DIFFICULTY_KEYWORDS = [
  '실시간',
  '결제',
  '권한',
  '로그인',
  '대용량',
  '보안',
  '개인정보',
  '배포',
  '스케줄러',
];

const MEDIUM_DIFFICULTY_KEYWORDS = [
  '관리자',
  '연동',
  '자동화',
  '대시보드',
  '크롤링',
  '알림',
  '엑셀',
];

function allRequirementText(analysis: AnalysisResult): string {
  return analysis.requirements
    .map(req => req.text)
    .join('\n')
    .toLowerCase();
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function classifyWorkTypes(text: string): { workTypes: WorkType[]; keywords: string[] } {
  const workTypes: WorkType[] = [];
  const keywords: string[] = [];

  for (const [workType, candidates] of Object.entries(WORK_TYPE_KEYWORDS) as [WorkType, string[]][]) {
    const matched = candidates.filter(keyword => text.includes(keyword.toLowerCase()));
    if (matched.length > 0) {
      workTypes.push(workType);
      keywords.push(...matched);
    }
  }

  return {
    workTypes: workTypes.length > 0 ? unique(workTypes) : ['other'],
    keywords: unique(keywords),
  };
}

function classifyDifficulty(text: string, analysis: AnalysisResult, workTypes: WorkType[]): Difficulty {
  let score = 0;

  score += HIGH_DIFFICULTY_KEYWORDS.filter(keyword => text.includes(keyword.toLowerCase())).length * 2;
  score += MEDIUM_DIFFICULTY_KEYWORDS.filter(keyword => text.includes(keyword.toLowerCase())).length;
  score += Math.max(0, workTypes.length - 1);

  if (analysis.requirements.length >= 8) score += 2;
  else if (analysis.requirements.length >= 4) score += 1;

  if (analysis.ambiguous_items.length >= 2) score += 1;
  if (analysis.missing_items.length >= 3) score += 1;

  if (score >= 5) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

function classifyComplexity(difficulty: Difficulty, workTypes: WorkType[]): Complexity {
  if (difficulty === 'high' || workTypes.length >= 3) return 'complex';
  if (difficulty === 'medium' || workTypes.length >= 2) return 'moderate';
  return 'simple';
}

export function classifyInquiry(analysis: AnalysisResult): Classification {
  const text = allRequirementText(analysis);
  const { workTypes, keywords } = classifyWorkTypes(text);
  const difficulty = classifyDifficulty(text, analysis, workTypes);
  const complexity = classifyComplexity(difficulty, workTypes);

  return {
    inquiry_id: analysis.inquiry_id,
    work_types: workTypes,
    difficulty,
    complexity,
    keywords,
  };
}
