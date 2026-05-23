import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
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

async function fullFlow() {
  const raw = await readFile(new URL('../data/samples/sample-01.txt', import.meta.url), 'utf8');
  const inquiry = parseInquiry(raw);
  const analysis = analyzeInquiry(inquiry);
  const classification = classifyInquiry(analysis);
  const estimate = estimateInquiry(analysis, classification);
  const risk = assessRisk(analysis, classification);
  const consultation = createConsultationMessage(analysis, classification);
  const message = createChannelMessage(consultation, 'wishket', estimate, risk);
  const prompts = generatePrompts(analysis, classification, estimate, risk);
  const request = createCodexValidationRequest(prompts);
  return { message, estimate, risk, request, prompts };
}

test('prompt-generation creates Claude and Codex goal prompts', async () => {
  const { prompts } = await fullFlow();

  assert.match(prompts.claude_implementation_prompt, /고객 메시지 발송/);
  assert.match(prompts.codex_goal_validation_prompt, /\/goal/);
  assert.match(prompts.codex_goal_validation_prompt, /승인 없는 발송 경로/);
});

test('validation and delivery package block unapproved delivery', async () => {
  const { message, estimate, risk, request } = await fullFlow();
  const validation = recordValidationResult(request, []);
  const pendingApproval = createApprovalRequest(message);
  const blocked = createDeliveryPackage(message, pendingApproval, validation, estimate, risk);

  assert.equal(validation.status, 'pass');
  assert.equal(blocked.ready, false);
  assert.ok(blocked.warnings.some(warning => warning.includes('승인 미완료')));
});

test('delivery package becomes ready only after approval and pass validation', async () => {
  const { message, estimate, risk, request } = await fullFlow();
  const validation = recordValidationResult(request, []);
  const approval = decideApproval(createApprovalRequest(message), 'approved', 'JH');
  const ready = createDeliveryPackage(message, approval, validation, estimate, risk);

  assert.equal(ready.ready, true);
  assert.match(ready.customer_message, /초안/);
  assert.ok(ready.included_items.length >= 4);
});
