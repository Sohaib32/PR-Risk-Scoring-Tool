#!/usr/bin/env node

/**
 * CLI for running Temporal workflows
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import { startPRRiskAnalysis, getWorkflowResult, cancelWorkflow } from './client';
import type { PRRiskAnalysisInput } from './workflows';
import * as fs from 'fs';
import * as readline from 'readline';

async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (process.stdin.isTTY) {
      reject(new Error('No input provided via stdin'));
      return;
    }

    let data = '';
    process.stdin.setEncoding('utf-8');

    process.stdin.on('data', (chunk) => {
      data += chunk;
    });

    process.stdin.on('end', () => {
      resolve(data);
    });

    process.stdin.on('error', (error) => {
      reject(error);
    });
  });
}

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .usage('Usage: $0 [command] [options]')
    .command(
      'start',
      'Start a PR risk analysis workflow',
      (yargs) => {
        return yargs
          .option('file', {
            alias: 'f',
            type: 'string',
            description: 'Path to diff file',
          })
          .option('base', {
            alias: 'b',
            type: 'string',
            description: 'Base branch/commit for comparison',
          })
          .option('head', {
            alias: 'h',
            type: 'string',
            description: 'Head branch/commit for comparison',
          })
          .option('stdin', {
            alias: 's',
            type: 'boolean',
            description: 'Read diff from stdin',
          })
          .option('uncommitted', {
            alias: 'u',
            type: 'boolean',
            description: 'Analyze uncommitted changes',
          })
          .option('title', {
            alias: 't',
            type: 'string',
            description: 'PR title (optional context)',
          })
          .option('description', {
            alias: 'd',
            type: 'string',
            description: 'PR description (optional context)',
          })
          .option('workflow-id', {
            type: 'string',
            description: 'Custom workflow ID',
          })
          .option('task-queue', {
            type: 'string',
            default: 'pr-risk-analysis',
            description: 'Task queue name',
          })
          .option('wait', {
            alias: 'w',
            type: 'boolean',
            description: 'Wait for workflow completion and print result',
          });
      },
      async (argv) => {
        try {
          // Determine diff source
          let diffSource: PRRiskAnalysisInput['diffSource'];
          let diffContent: string | undefined;

          if (argv.file) {
            diffSource = {
              type: 'file',
              filePath: argv.file,
            };
          } else if (argv.stdin) {
            diffContent = await readStdin();
            diffSource = {
              type: 'stdin',
              diffContent,
            };
          } else if (argv.uncommitted) {
            diffSource = {
              type: 'uncommitted',
            };
          } else if (argv.base && argv.head) {
            diffSource = {
              type: 'branches',
              base: argv.base,
              head: argv.head,
            };
          } else {
            console.error(
              chalk.red('Error: Must specify one of: --file, --stdin, --uncommitted, or --base/--head')
            );
            process.exit(1);
          }

          const input: PRRiskAnalysisInput = {
            diffSource,
            prTitle: argv.title,
            prDescription: argv.description,
            workflowId: argv['workflow-id'],
          };

          const { workflowId, runId, result } = await startPRRiskAnalysis(input, {
            taskQueue: argv['task-queue'] as string,
            workflowId: argv['workflow-id'],
          });

          console.log(chalk.green('Workflow started:'));
          console.log(`  Workflow ID: ${workflowId}`);
          console.log(`  Run ID: ${runId}`);

          if (argv.wait) {
            console.log(chalk.cyan('\nWaiting for workflow to complete...'));
            const output = await result;
            console.log(chalk.green('\nWorkflow completed:'));
            console.log(JSON.stringify(output, null, 2));
          } else {
            console.log(chalk.yellow('\nUse --wait to wait for completion, or query the workflow later.'));
          }
        } catch (error) {
          console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
          process.exit(1);
        }
      }
    )
    .command(
      'result <workflow-id>',
      'Get result of a completed workflow',
      (yargs) => {
        return yargs.positional('workflow-id', {
          type: 'string',
          description: 'Workflow ID',
          demandOption: true,
        });
      },
      async (argv) => {
        try {
          const result = await getWorkflowResult(argv.workflowId as string);
          console.log(JSON.stringify(result, null, 2));
        } catch (error) {
          console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
          process.exit(1);
        }
      }
    )
    .command(
      'cancel <workflow-id>',
      'Cancel a running workflow',
      (yargs) => {
        return yargs.positional('workflow-id', {
          type: 'string',
          description: 'Workflow ID',
          demandOption: true,
        });
      },
      async (argv) => {
        try {
          await cancelWorkflow(argv.workflowId as string);
          console.log(chalk.green(`Workflow ${argv.workflowId} cancelled`));
        } catch (error) {
          console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
          process.exit(1);
        }
      }
    )
    .help()
    .version()
    .demandCommand(1, 'You need at least one command before moving on')
    .example('$0 start --base main --head feature-branch --wait', 'Start workflow and wait for result')
    .example('$0 start --file diff.txt', 'Start workflow from file')
    .example('$0 result <workflow-id>', 'Get workflow result')
    .example('$0 cancel <workflow-id>', 'Cancel a workflow')
    .argv;
}

main();
