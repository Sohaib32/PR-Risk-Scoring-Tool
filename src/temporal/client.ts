/**
 * Temporal Client for starting PR Risk Analysis workflows
 */

import { Connection, Client } from '@temporalio/client';
import type { PRRiskAnalysisInput, PRRiskAnalysisOutput } from './workflows';
import { logger } from '../utils/logger';

/**
 * Create a Temporal client
 */
export async function createTemporalClient(): Promise<Client> {
  const connection = await Connection.connect({
    address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
  });

  return new Client({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE || 'default',
  });
}

/**
 * Start a PR risk analysis workflow
 */
export async function startPRRiskAnalysis(
  input: PRRiskAnalysisInput,
  options: {
    taskQueue?: string;
    workflowId?: string;
    client?: Client;
  } = {}
): Promise<{
  workflowId: string;
  runId: string;
  result: Promise<PRRiskAnalysisOutput>;
}> {
  const {
    taskQueue = 'pr-risk-analysis',
    workflowId = `pr-risk-analysis-${Date.now()}`,
    client,
  } = options;

  const temporalClient = client || (await createTemporalClient());

  logger.info('Starting PR risk analysis workflow', {
    workflowId,
    taskQueue,
    diffSourceType: input.diffSource.type,
  });

  const handle = await temporalClient.workflow.start('analyzePRRiskWorkflow', {
    taskQueue,
    workflowId: input.workflowId || workflowId,
    args: [input],
  });

  logger.info('Workflow started', {
    workflowId: handle.workflowId,
    runId: handle.firstExecutionRunId,
  });

  return {
    workflowId: handle.workflowId,
    runId: handle.firstExecutionRunId,
    result: handle.result(),
  };
}

/**
 * Get workflow result by ID
 */
export async function getWorkflowResult(
  workflowId: string,
  options: {
    client?: Client;
  } = {}
): Promise<PRRiskAnalysisOutput> {
  const client = options.client || (await createTemporalClient());

  const handle = client.workflow.getHandle(workflowId);
  return handle.result();
}

/**
 * Cancel a running workflow
 */
export async function cancelWorkflow(
  workflowId: string,
  options: {
    client?: Client;
  } = {}
): Promise<void> {
  const client = options.client || (await createTemporalClient());

  const handle = client.workflow.getHandle(workflowId);
  await handle.cancel();
  logger.info('Workflow cancelled', { workflowId });
}
