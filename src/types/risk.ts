/** 리스크 평가 스키마. */

export type RiskImpact = 'low' | 'medium' | 'high' | 'critical';
export type RiskLikelihood = 'rare' | 'possible' | 'likely' | 'almost_certain';

export interface RiskItem {
  id: string;
  description: string;
  impact: RiskImpact;
  likelihood: RiskLikelihood;
  mitigation: string;
}

export interface RiskAssessment {
  inquiry_id: string;
  items: RiskItem[];
  overall_level: RiskImpact;
}
