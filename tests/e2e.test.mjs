import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';
import { analyzeInquiry } from '../dist/analysis/index.js';
import { createApprovalRequest, decideApproval } from '../dist/approval/index.js';
import { classifyInquiry } from '../dist/classification/index.js';
import { createConsultationMessage } from '../dist/consultation/index.js';
import { createDeliveryPackage } from '../dist/delivery-package/index.js';
import { estimateInquiry } from '../dist/estimate/index.js';
import { parseInquiry } from '../dist/intake/index.js';
import { createChannelMessage } from '../dist/messaging/index.js';
import { generatePrompts } from '../dist/prompt-generation/index.js';
import { assessRisk } from '../dist/risk/index.js';
import { createCodexValidationRequest, recordValidationResult } from '../dist/validation/index.js';

test('sample inquiries run through full MVP pipeline', async () => {
  const sampleDir = new URL('../data/samples/', import.meta.url);
  const names = (await readdir(sampleDir)).filter(name => name.endsWith('.txt')).sort();

  assert.equal(names.length, 3);

  for (const name of names) {
    const raw = await readFile(new URL(name, sampleDir), 'utf8');
    const inquiry = parseInquiry(raw);
    const analysis = analyzeInquiry(inquiry);
    const classification = classifyInquiry(analysis);
    const consultation = createConsultationMessage(analysis, classification);
    const estimate = estimateInquiry(analysis, classification);
    const risk = assessRisk(analysis, classification);
    const message = createChannelMessage(consultation, 'wishket', estimate, risk);
    const prompts = generatePrompts(analysis, classification, estimate, risk);
    const request = createCodexValidationRequest(prompts);
    const validation = recordValidationResult(request, []);
    const pendingPackage = createDeliveryPackage(
      message,
      createApprovalRequest(message),
      validation,
      estimate,
      risk,
    );
    const approvedPackage = createDeliveryPackage(
      message,
      decideApproval(createApprovalRequest(message), 'approved', 'JH'),
      validation,
      estimate,
      risk,
    );

    assert.ok(analysis.requirements.length > 0, name);
    assert.ok(classification.work_types.length > 0, name);
    assert.ok(consultation.draft_body.includes('초안') || consultation.draft_body.includes('검토'), name);
    assert.ok(estimate.assumptions.length > 0, name);
    assert.ok(prompts.codex_goal_validation_prompt.includes('/goal'), name);
    assert.equal(pendingPackage.ready, false, name);
    assert.equal(approvedPackage.warnings.some(warning => warning.includes('승인 미완료')), false, name);
  }
});
