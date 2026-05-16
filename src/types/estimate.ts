/** 견적 산정 스키마. */

export interface EstimateRange {
  low: number;
  mid: number;
  high: number;
  currency: 'KRW' | 'USD';
}

export interface ScheduleEstimate {
  min_days: number;
  expected_days: number;
  max_days: number;
}

export interface Estimate {
  inquiry_id: string;
  cost: EstimateRange;
  schedule: ScheduleEstimate;
  assumptions: string[];
}
