import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, extname, join, resolve } from 'node:path';
import { createApprovalRequest, decideApproval } from './approval/index.js';
import { assessRisk } from './risk/index.js';
import { analyzeInquiry } from './analysis/index.js';
import { classifyInquiry } from './classification/index.js';
import { createChannelMessage } from './messaging/index.js';
import { createCodexValidationRequest, recordValidationResult } from './validation/index.js';
import { createConsultationMessage } from './consultation/index.js';
import { createDeliveryPackage } from './delivery-package/index.js';
import { estimateInquiry } from './estimate/index.js';
import { generatePrompts } from './prompt-generation/index.js';
import { parseInquiry } from './intake/index.js';

interface CliOptions {
  inputPath: string;
  outDir: string;
  channel: 'wishket' | 'email' | 'telegram';
  approve: boolean;
  approver: string;
  validationPass: boolean;
}

function usage(): string {
  return [
    'Usage: node dist/cli.js <input-file> [options]',
    '',
    'Options:',
    '  --out <dir>              Output directory (default: data/outputs)',
    '  --channel <name>         wishket | email | telegram (default: wishket)',
    '  --approve                Mark customer-message approval as approved',
    '  --approver <name>        Approver name when --approve is used (default: JH)',
    '  --validation-pass        Mark Codex validation as pass for this manual run',
  ].join('\n');
}

function readFlagValue(args: string[], index: number, flag: string): string {
  const value = args[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`${flag} needs a value`);
  }
  return value;
}

function parseArgs(args: string[]): CliOptions {
  const normalizedArgs = args.filter(arg => arg !== '--');
  const inputPath = normalizedArgs.find(arg => !arg.startsWith('--'));
  if (!inputPath) throw new Error(`Missing input file\n\n${usage()}`);

  const options: CliOptions = {
    inputPath,
    outDir: 'data/outputs',
    channel: 'wishket',
    approve: false,
    approver: 'JH',
    validationPass: false,
  };

  for (let i = 0; i < normalizedArgs.length; i += 1) {
    const arg = normalizedArgs[i];
    if (!arg.startsWith('--')) continue;

    if (arg === '--out') {
      options.outDir = readFlagValue(normalizedArgs, i, arg);
      i += 1;
      continue;
    }
    if (arg === '--channel') {
      const value = readFlagValue(normalizedArgs, i, arg);
      if (!['wishket', 'email', 'telegram'].includes(value)) {
        throw new Error(`Unsupported channel: ${value}`);
      }
      options.channel = value as CliOptions['channel'];
      i += 1;
      continue;
    }
    if (arg === '--approver') {
      options.approver = readFlagValue(normalizedArgs, i, arg);
      i += 1;
      continue;
    }
    if (arg === '--approve') {
      options.approve = true;
      continue;
    }
    if (arg === '--validation-pass') {
      options.validationPass = true;
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  return options;
}

function safeName(inputPath: string): string {
  const name = basename(inputPath, extname(inputPath)).toLowerCase();
  return name.replace(/[^a-z0-9가-힣_-]+/gi, '-').replace(/^-+|-+$/g, '') || 'inquiry';
}

function costRange(low: number, high: number, currency: string): string {
  return `${low.toLocaleString('ko-KR')}~${high.toLocaleString('ko-KR')} ${currency}`;
}

function toMarkdown(result: ReturnType<typeof runPipeline>): string {
  const {
    analysis,
    classification,
    consultation,
    estimate,
    risk,
    message,
    approval,
    validation,
    deliveryPackage,
    prompts,
  } = result;

  return [
    '# Wishket Manual E2E Result',
    '',
    `- Inquiry ID: ${analysis.inquiry_id}`,
    `- Ready: ${deliveryPackage.ready ? 'yes' : 'no'}`,
    `- Work types: ${classification.work_types.join(', ')}`,
    `- Difficulty: ${classification.difficulty}`,
    `- Complexity: ${classification.complexity}`,
    `- Confidence: ${analysis.confidence}`,
    `- Estimate: ${costRange(estimate.cost.low, estimate.cost.high, estimate.cost.currency)}`,
    `- Schedule: ${estimate.schedule.min_days}~${estimate.schedule.max_days} days`,
    `- Risk: ${risk.overall_level}`,
    `- Approval: ${approval.state}`,
    `- Validation: ${validation.status}`,
    '',
    '## Missing Items',
    ...(analysis.missing_items.length > 0
      ? analysis.missing_items.map(item => `- ${item.field}: ${item.reason}`)
      : ['- none']),
    '',
    '## Ambiguous Items',
    ...(analysis.ambiguous_items.length > 0
      ? analysis.ambiguous_items.map(item => `- ${item.field}: ${item.clarification_needed}`)
      : ['- none']),
    '',
    '## Warnings',
    ...(deliveryPackage.warnings.length > 0
      ? deliveryPackage.warnings.map(warning => `- ${warning}`)
      : ['- none']),
    '',
    '## Customer Message Draft',
    '',
    message.body,
    '',
    '## Consultation Draft',
    '',
    consultation.draft_body,
    '',
    '## Claude Prompt',
    '',
    '```text',
    prompts.claude_implementation_prompt,
    '```',
    '',
    '## Codex Validation Prompt',
    '',
    '```text',
    prompts.codex_goal_validation_prompt,
    '```',
    '',
  ].join('\n');
}

function runPipeline(rawText: string, options: CliOptions) {
  const inquiry = parseInquiry(rawText);
  const analysis = analyzeInquiry(inquiry);
  const classification = classifyInquiry(analysis);
  const consultation = createConsultationMessage(analysis, classification);
  const estimate = estimateInquiry(analysis, classification);
  const risk = assessRisk(analysis, classification);
  const message = createChannelMessage(consultation, options.channel, estimate, risk);
  const approvalRequest = createApprovalRequest(message);
  const approval = options.approve
    ? decideApproval(approvalRequest, 'approved', options.approver, 'Manual CLI approval')
    : approvalRequest;
  const prompts = generatePrompts(analysis, classification, estimate, risk);
  const validationRequest = createCodexValidationRequest(prompts);
  const validation = recordValidationResult(
    validationRequest,
    options.validationPass ? [] : ['Manual validation was not marked as pass'],
  );
  const deliveryPackage = createDeliveryPackage(message, approval, validation, estimate, risk);

  return {
    inquiry,
    analysis,
    classification,
    consultation,
    estimate,
    risk,
    message,
    approval,
    prompts,
    validationRequest,
    validation,
    deliveryPackage,
  };
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const rawText = await readFile(options.inputPath, 'utf8');
  const result = runPipeline(rawText, options);
  const outDir = resolve(options.outDir);
  await mkdir(outDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const prefix = `${stamp}-${safeName(options.inputPath)}-${result.analysis.inquiry_id.slice(0, 8)}`;
  const jsonPath = join(outDir, `${prefix}.json`);
  const markdownPath = join(outDir, `${prefix}.md`);

  await writeFile(jsonPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  await writeFile(markdownPath, toMarkdown(result), 'utf8');

  console.log(JSON.stringify({
    inquiry_id: result.analysis.inquiry_id,
    ready: result.deliveryPackage.ready,
    json: jsonPath,
    markdown: markdownPath,
  }, null, 2));
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
