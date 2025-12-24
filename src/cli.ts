#!/usr/bin/env node

/**
 * CLI for PR Risk Scoring Tool
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as readline from 'readline';
import chalk from 'chalk';
import type { DiffAnalysisInput } from './types';

function createQuestionInterface() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (q: string) =>
    new Promise<string>((resolve) => {
      rl.question(q, (answer) => resolve(answer.trim()));
    });

  const close = () => rl.close();

  return { question, close };
}

async function runInteractive() {
  const { question, close } = createQuestionInterface();

  try {
    console.log(chalk.cyan.bold('PR Risk Analyzer - Interactive Mode'));
    console.log(chalk.cyan('==================================='));
    console.log(chalk.bold('Choose what you want to analyze:'));
    console.log(`  ${chalk.green('1)')} Diff from file`);
    console.log(`  ${chalk.green('2)')} Uncommitted git changes`);
    console.log(`  ${chalk.green('3)')} Between two branches/commits`);
    console.log(
      `  ${chalk.green(
        '4)'
      )} Diff from stdin (pipe or paste, e.g. git diff | pr-risk-analyzer)`
    );
    console.log('');

    const sourceChoice = await question(chalk.yellow('Enter choice (1-4): '));

    let file: string | undefined;
    let base: string | undefined;
    let head: string | undefined;
    let useStdin = false;

    if (sourceChoice === '1') {
      file = await question(chalk.yellow('Path to diff file: '));
      if (!file) {
        throw new Error('Diff file path is required');
      }
    } else if (sourceChoice === '2') {
      // uncommitted: nothing extra needed
    } else if (sourceChoice === '3') {
      base = await question(chalk.yellow('Base branch/commit (e.g. main): '));
      head = await question(chalk.yellow('Head branch/commit (e.g. feature-branch): '));
      if (!base || !head) {
        throw new Error('Both base and head are required for branch comparison');
      }
    } else if (sourceChoice === '4') {
      useStdin = true;
      if (process.stdin.isTTY) {
        throw new Error(
          'No diff data was provided on stdin. To use option 4, pipe a diff into pr-risk-analyzer, e.g.:\n' +
            '  git diff | pr-risk-analyzer --interactive'
        );
      }
    } else {
      throw new Error('Invalid choice. Please run again and choose 1, 2, 3, or 4.');
    }

    console.log('');
    const title = await question(
      chalk.yellow('PR title (optional, press Enter to skip): ')
    );

    console.log('');
    console.log(chalk.bold('Choose output format:'));
    console.log(`  ${chalk.green('1)')} Beautiful report (default)`);
    console.log(`  ${chalk.green('2)')} Colored JSON`);
    console.log(`  ${chalk.green('3)')} Raw JSON`);
    const formatChoice = await question(chalk.yellow('Enter choice (1-3): '));

    let format: 'beautiful' | 'pretty' | 'json' = 'beautiful';
    if (formatChoice === '2') format = 'pretty';
    if (formatChoice === '3') format = 'json';

    console.log('');
    console.log(chalk.bold('\nCI-style options (optional)'));
    console.log(chalk.gray('---------------------------'));
    const failOnRisk = await question(
      chalk.yellow('Fail if risk is at least (LOW/MEDIUM/HIGH, or Enter to skip): ')
    );

    const failOnMissingTestsAnswer = await question(
      chalk.yellow('Fail when tests are missing? (y/N): ')
    );
    const failOnMissingTests =
      failOnMissingTestsAnswer.toLowerCase() === 'y' ||
      failOnMissingTestsAnswer.toLowerCase() === 'yes';

    return {
      file: file || undefined,
      base: base || undefined,
      head: head || undefined,
      useStdin,
      title: title || undefined,
      description: undefined,
      format,
      failOnRisk: failOnRisk || undefined,
      failOnMissingTests,
    };
  } catch (err) {
    console.error(chalk.red('An error occurred during interactive prompts. Exiting.'));
    if (err instanceof Error && err.message) {
      console.error(chalk.gray(err.message));
    }
    throw err;
  } finally {
    close();
  }
}

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .usage('Usage: $0 [options]')
    .option('file', {
      alias: 'f',
      type: 'string',
      description: 'Path to diff file'
    })
    .option('base', {
      alias: 'b',
      type: 'string',
      description: 'Base branch/commit for comparison'
    })
    .option('head', {
      alias: 'h',
      type: 'string',
      description: 'Head branch/commit for comparison'
    })
    .option('stdin', {
      alias: 's',
      type: 'boolean',
      description: 'Read diff from stdin'
    })
    .option('uncommitted', {
      alias: 'u',
      type: 'boolean',
      description: 'Analyze uncommitted changes'
    })
    .option('api-key', {
      alias: 'k',
      type: 'string',
      description: 'Groq API key (or set GROQ_API_KEY or OPENAI_API_KEY env var)'
    })
    .option('title', {
      alias: 't',
      type: 'string',
      description: 'PR title (optional context)'
    })
    .option('description', {
      alias: 'd',
      type: 'string',
      description: 'PR description (optional context)'
    })
    .option('format', {
      alias: 'o',
      type: 'string',
      choices: ['json', 'pretty', 'beautiful'],
      default: 'beautiful',
      description: 'Output format: json (raw JSON), pretty (colored JSON), beautiful (formatted report)'
    })
    .option('fail-on-risk', {
      type: 'string',
      choices: ['LOW', 'MEDIUM', 'HIGH'],
      description: 'If set, exit with non-zero code when overall risk_level is >= given threshold (for CI)'
    })
    .option('fail-on-missing-tests', {
      type: 'boolean',
      description: 'If set, exit with non-zero code when missing_tests is true'
    })
    .option('ui', {
      alias: 'i',
      type: 'boolean',
      description: 'Run in interactive UI mode with menus and prompts'
    })
    .help()
    .version()
    .alias('version', 'v')
    .example('$0 --base main --head feature-branch', 'Analyze diff between branches')
    .example('$0 --file diff.txt', 'Analyze diff from file')
    .example('git diff | $0 --stdin', 'Analyze diff from stdin')
    .example('$0 --uncommitted', 'Analyze uncommitted changes')
    .argv;

  try {
    // Lazy imports to avoid loading env/providers on --help
    const { GitDiffExtractor } = await import('./gitDiffExtractor');
    const { RiskAnalyzer } = await import('./riskAnalyzer');
    const { formatRiskAssessment, formatRiskAssessmentJSON } = await import('./formatter');

    // Optionally gather options interactively
    let interactiveOptions:
      | {
          file?: string;
          base?: string;
          head?: string;
          useStdin?: boolean;
          title?: string;
          description?: string;
          format: 'beautiful' | 'pretty' | 'json';
          failOnRisk?: string;
          failOnMissingTests: boolean;
        }
      | undefined;

    if (argv.ui) {
      interactiveOptions = await runInteractive();
    }

    const effectiveFile = interactiveOptions?.file ?? argv.file;
    const effectiveBase = interactiveOptions?.base ?? argv.base;
    const effectiveHead = interactiveOptions?.head ?? argv.head;
    const effectiveStdin =
      interactiveOptions?.useStdin ?? (argv.stdin as boolean | undefined);
    const interactiveUncommitted =
      !!interactiveOptions &&
      !interactiveOptions.file &&
      !interactiveOptions.base &&
      !interactiveOptions.head &&
      !interactiveOptions.useStdin;
    const effectiveUncommitted = interactiveOptions
      ? interactiveUncommitted
      : argv.uncommitted;

    // Get the diff
    let diff: string;

    if (effectiveFile) {
      diff = GitDiffExtractor.readDiffFromFile(effectiveFile);
    } else if (effectiveStdin) {
      diff = await GitDiffExtractor.readDiffFromStdin();
    } else if (effectiveUncommitted) {
      const extractor = new GitDiffExtractor();
      diff = await extractor.getUncommittedDiff();
    } else if (effectiveBase && effectiveHead) {
      const extractor = new GitDiffExtractor();
      diff = await extractor.getDiff(effectiveBase, effectiveHead);
    } else {
      console.error('Error: Must specify one of: --file, --stdin, --uncommitted, or --base/--head');
      process.exit(1);
    }

    if (!diff || diff.trim().length === 0) {
      console.error('Error: No diff content found');
      process.exit(1);
    }

    // Analyze the diff
    const analyzer = new RiskAnalyzer(argv['api-key']);
    const input: DiffAnalysisInput = {
      diff,
      prTitle: interactiveOptions?.title ?? argv.title,
      prDescription: interactiveOptions?.description ?? argv.description
    };

    const assessment = await analyzer.analyzeDiff(input);

    // Output the result based on format option
    const format =
      interactiveOptions?.format ?? ((argv.format as 'json' | 'pretty' | 'beautiful') || 'beautiful');
    
    switch (format) {
      case 'json':
        // Raw JSON output
        console.log(JSON.stringify(assessment, null, 2));
        break;
      case 'pretty':
        // Colored JSON output
        console.log(formatRiskAssessmentJSON(assessment));
        break;
      case 'beautiful':
      default:
        // Beautiful formatted output
        console.log(formatRiskAssessment(assessment));
        break;
    }

    // CI integration: determine appropriate exit code based on risk and options
    const riskLevelOrder: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };
    let exitCode = 0;

    const failOnRisk =
      interactiveOptions?.failOnRisk ?? (argv['fail-on-risk'] as string | undefined);
    if (failOnRisk) {
      const threshold = riskLevelOrder[failOnRisk];
      const actual = riskLevelOrder[assessment.risk_level];
      if (threshold !== undefined && actual !== undefined && actual >= threshold) {
        exitCode = 2; // 2 = failed due to high-enough risk
      }
    }

    const failOnMissingTests =
      interactiveOptions?.failOnMissingTests ??
      ((argv['fail-on-missing-tests'] as boolean | undefined) ?? false);
    if (failOnMissingTests && assessment.missing_tests) {
      // Use exit code 3 for missing tests, but keep exit code 2 if risk threshold was already violated
      exitCode = exitCode === 0 ? 3 : exitCode;
    }

    if (exitCode !== 0) {
      process.exit(exitCode);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      // Log stack trace in development mode
      if (process.env.NODE_ENV === 'development' && error.stack) {
        console.error('\nStack trace:', error.stack);
      }
    } else {
      console.error('Unknown error occurred');
    }
    process.exit(1);
  }
}

main();
