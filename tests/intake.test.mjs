import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parseInquiry } from '../dist/intake/index.js';

test('parseInquiry keeps multiline field values until next label', async () => {
  const raw = await readFile(new URL('../data/samples/sample-01.txt', import.meta.url), 'utf8');
  const inquiry = parseInquiry(raw);

  assert.equal(inquiry.project_title, '쇼핑몰 주문 엑셀 자동 정리 및 알림 봇');
  assert.match(inquiry.description, /배송 지연 주문/);
  assert.deepEqual(inquiry.required_skills, ['Node.js', 'Excel', 'Telegram Bot']);
  assert.match(inquiry.dev_scope, /결과 CSV 생성/);
});
