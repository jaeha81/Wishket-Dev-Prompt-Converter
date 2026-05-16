/** 자동화 개발 사양서 스키마. */

export interface SpecIO {
  inputs: string[];
  outputs: string[];
}

export interface SpecDependency {
  name: string;
  purpose: string;
}

export interface AutomationSpec {
  inquiry_id: string;
  purpose: string;
  io: SpecIO;
  dependencies: SpecDependency[];
  validation_criteria: string[];
  out_of_scope: string[];
}
