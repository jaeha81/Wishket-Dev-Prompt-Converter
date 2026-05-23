import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { analyzeInquiry } from '../dist/analysis/index.js';
import { classifyInquiry } from '../dist/classification/index.js';
import { createConsultationMessage } from '../dist/consultation/index.js';
import { parseInquiry } from '../dist/intake/index.js';

test('analysis to consultation MVP flow produces questions and draft', async () => {
  const raw = await readFile(new URL('../data/samples/sample-01.txt', import.meta.url), 'utf8');
  const inquiry = parseInquiry(raw);
  const analysis = analyzeInquiry(inquiry);
  const classification = classifyInquiry(analysis);
  const consultation = createConsultationMessage(analysis, classification);

  assert.ok(analysis.requirements.length >= 6);
  assert.ok(classification.work_types.includes('automation'));
  assert.ok(classification.work_types.includes('bot'));
  assert.match(consultation.draft_body, /초기 검토/);
  assert.ok(consultation.schedule_assumptions.length > 0);
});
