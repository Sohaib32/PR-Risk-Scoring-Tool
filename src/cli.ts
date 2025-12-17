#!/usr/bin/env node

/**
 * CLI for PR Risk Scoring Tool
 */

import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { RiskAnalyzer } from './riskAnalyzer';
import { GitDiffExtractor } from './gitDiffExtractor';
import { DiffAnalysisInput } from './types';
import { formatRiskAssessment, formatRiskAssessmentJSON } from './formatter';

// Load environment variables from .env file
dotenv.config();

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
    .help()
    .version()
    .alias('version', 'v')
    .example('$0 --base main --head feature-branch', 'Analyze diff between branches')
    .example('$0 --file diff.txt', 'Analyze diff from file')
    .example('git diff | $0 --stdin', 'Analyze diff from stdin')
    .example('$0 --uncommitted', 'Analyze uncommitted changes')
    .argv;

  try {
    // Get the diff
    let diff: string;

    if (argv.file) {
      diff = GitDiffExtractor.readDiffFromFile(argv.file);
    } else if (argv.stdin) {
      diff = await GitDiffExtractor.readDiffFromStdin();
    } else if (argv.uncommitted) {
      const extractor = new GitDiffExtractor();
      diff = await extractor.getUncommittedDiff();
    } else if (argv.base && argv.head) {
      const extractor = new GitDiffExtractor();
      diff = await extractor.getDiff(argv.base, argv.head);
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
      prTitle: argv.title,
      prDescription: argv.description
    };

    const assessment = await analyzer.analyzeDiff(input);

    // Output the result based on format option
    const format = argv.format || 'beautiful';
    
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
