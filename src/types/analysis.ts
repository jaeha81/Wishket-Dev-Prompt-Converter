/** 의뢰서 분석 결과 스키마. */

export interface ExtractedRequirement {
  id: string;
  category: 'functional' | 'non_functional' | 'constraint';
  text: string;
}

export interface MissingItem {
  field: string;
  reason: string;
}

export interface AmbiguousItem {
  field: string;
  text: string;
  clarification_needed: string;
}

export interface AnalysisResult {
  inquiry_id: string;
  requirements: ExtractedRequirement[];
  missing_items: MissingItem[];
  ambiguous_items: AmbiguousItem[];
  confidence: number;
}
