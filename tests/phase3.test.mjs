import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { analyzeInquiry } from '../dist/analysis/index.js';
import { createApprovalRequest, decideApproval, canSend } from '../dist/approval/index.js';
import { classifyInquiry } from '../dist/classification/index.js';
import { createConsultationMessage } from '../dist/consultation/index.js';
import { estimateInquiry } from '../dist/estimate/index.js';
import { createChannelMessage } from '../dist/messaging/index.js';
import { parseInquiry } from '../dist/intake/index.js';
import { assessRisk } from '../dist/risk/index.js';

async function sampleFlow() {
  const raw = await readFile(new URL('../data/samples/sample-01.txt', import.meta.url), 'utf8');
  const inquiry = parseInquiry(raw);
  const analysis = analyzeInquiry(inquiry);
  const classification = classifyInquiry(analysis);
  const consultation = createConsultationMessage(analysis, classification);
  const estimate = estimateInquiry(analysis, classification);
  const risk = assessRisk(analysis, classification);
  const message = createChannelMessage(consultation, 'email', estimate, risk);
  return { message, estimate, risk };
}

test('estimate produces KRW range and schedule assumptions', async () => {
  const { estimate } = await sampleFlow();

  assert.equal(estimate.cost.currency, 'KRW');
  assert.ok(estimate.cost.low < estimate.cost.mid);
  assert.ok(estimate.cost.mid < estimate.cost.high);
  assert.ok(estimate.schedule.expected_days > 0);
});

test('message cannot be sent before human approval', async () => {
  const { message } = await sampleFlow();
  const pending = createApprovalRequest(message);
  const approved = decideApproval(pending, 'approved', 'JH', '초안 확인 완료');

  assert.match(message.body, /발송 전 사람 승인/);
  assert.equal(canSend(pending), false);
  assert.equal(canSend(approved), true);
});

test('risk assessment returns structured overall level', async () => {
  const { risk } = await sampleFlow();

  assert.ok(['low', 'medium', 'high', 'critical'].includes(risk.overall_level));
  assert.ok(Array.isArray(risk.items));
});
