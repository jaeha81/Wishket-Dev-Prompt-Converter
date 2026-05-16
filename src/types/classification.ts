/** 개발 작업 분류 스키마. */

export type WorkType =
  | 'automation'
  | 'integration'
  | 'scraping'
  | 'bot'
  | 'dashboard'
  | 'data_pipeline'
  | 'api'
  | 'other';

export type Difficulty = 'low' | 'medium' | 'high';
export type Complexity = 'simple' | 'moderate' | 'complex';

export interface Classification {
  inquiry_id: string;
  work_types: WorkType[];
  difficulty: Difficulty;
  complexity: Complexity;
  keywords: string[];
}
