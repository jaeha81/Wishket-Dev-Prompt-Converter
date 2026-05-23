import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';

const execFileAsync = promisify(execFile);

test('CLI runs one inquiry and writes JSON and markdown outputs', async () => {
  const outDir = await mkdtemp(join(tmpdir(), 'wishket-e2e-'));
  const { stdout } = await execFileAsync(process.execPath, [
    'dist/cli.js',
    'data/samples/sample-01.txt',
    '--out',
    outDir,
    '--approve',
    '--validation-pass',
  ]);
  const result = JSON.parse(stdout);

  assert.equal(typeof result.inquiry_id, 'string');
  assert.equal(typeof result.ready, 'boolean');
  assert.ok(result.json.endsWith('.json'));
  assert.ok(result.markdown.endsWith('.md'));

  const json = JSON.parse(await readFile(result.json, 'utf8'));
  const markdown = await readFile(result.markdown, 'utf8');

  assert.equal(json.analysis.inquiry_id, result.inquiry_id);
  assert.equal(json.validation.status, 'pass');
  assert.equal(json.approval.state, 'approved');
  assert.match(markdown, /Wishket Manual E2E Result/);
});
