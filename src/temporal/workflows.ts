/**
 * Temporal workflows for PR Risk Analysis
 * Workflows orchestrate activities and define the business logic
 */

import { proxyActivities, log } from '@temporalio/workflow';
import type { RiskAnalysisActivities } from './activities';
import type { DiffAnalysisInput, RiskAssessment } from '../types';

// Create activity proxy
const activities = proxyActivities<RiskAnalysisActivities>({
  startToCloseTimeout: '5 minutes',
  retry: {
    initialInterval: '1s',
    backoffCoefficient: 2,
    maximumInterval: '100s',
    maximumAttempts: 3,
  },
});

/**
 * Workflow input for PR risk analysis
 */
export interface PRRiskAnalysisInput {
  // Diff source configuration
  diffSource: {
    type: 'file' | 'uncommitted' | 'branches' | 'stdin';
    filePath?: string;
    base?: string;
    head?: string;
    diffContent?: string;
    repoPath?: string;
  };
  
  // Optional PR context
  prTitle?: string;
  prDescription?: string;
  
  // Workflow options
  workflowId?: string;
}

/**
 * Workflow output
 */
export interface PRRiskAnalysisOutput {
  assessment: RiskAssessment;
  diff: string;
  timestamp: string;
}

/**
 * Main workflow for analyzing PR risk
 * This workflow orchestrates the extraction of git diff and risk analysis
 */
export async function analyzePRRiskWorkflow(
  input: PRRiskAnalysisInput
): Promise<PRRiskAnalysisOutput> {
  log.info('Starting PR risk analysis workflow', { input });

  try {
    // Step 1: Extract git diff
    log.info('Extracting git diff', { type: input.diffSource.type });
    const diff = await activities.extractGitDiff(input.diffSource);

    if (!diff || diff.trim().length === 0) {
      throw new Error('No diff content extracted');
    }

    log.info('Git diff extracted', { diffLength: diff.length });

    // Step 2: Analyze risk
    log.info('Analyzing risk');
    const analysisInput: DiffAnalysisInput = {
      diff,
      prTitle: input.prTitle,
      prDescription: input.prDescription,
    };

    const assessment = await activities.analyzeRisk(analysisInput);

    log.info('Risk analysis completed', {
      riskLevel: assessment.risk_level,
      riskFactors: assessment.risk_factors.length,
    });

    return {
      assessment,
      diff,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    log.error('Workflow failed', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}
