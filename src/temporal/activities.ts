/**
 * Temporal activities for PR Risk Analysis
 * Activities are the actual work that gets executed
 */

import { proxyActivities } from '@temporalio/workflow';
import { GitDiffExtractor } from '../gitDiffExtractor';
import { RiskAnalyzer } from '../riskAnalyzer';
import type { DiffAnalysisInput, RiskAssessment } from '../types';

// Define activity interface
export interface RiskAnalysisActivities {
  extractGitDiff: (params: {
    type: 'file' | 'uncommitted' | 'branches' | 'stdin';
    filePath?: string;
    base?: string;
    head?: string;
    diffContent?: string;
    repoPath?: string;
  }) => Promise<string>;
  
  analyzeRisk: (input: DiffAnalysisInput) => Promise<RiskAssessment>;
}

// Activity implementations
export const riskAnalysisActivities = {
  /**
   * Extract git diff from various sources
   */
  async extractGitDiff(params: {
    type: 'file' | 'uncommitted' | 'branches' | 'stdin';
    filePath?: string;
    base?: string;
    head?: string;
    diffContent?: string;
    repoPath?: string;
  }): Promise<string> {
    const { type, filePath, base, head, diffContent, repoPath } = params;

    switch (type) {
      case 'file':
        if (!filePath) {
          throw new Error('File path is required for file type');
        }
        return GitDiffExtractor.readDiffFromFile(filePath);

      case 'uncommitted': {
        const extractor = new GitDiffExtractor(repoPath);
        return extractor.getUncommittedDiff();
      }

      case 'branches': {
        if (!base || !head) {
          throw new Error('Both base and head are required for branches type');
        }
        const extractor = new GitDiffExtractor(repoPath);
        return extractor.getDiff(base, head);
      }

      case 'stdin': {
        if (!diffContent) {
          throw new Error('Diff content is required for stdin type');
        }
        return diffContent;
      }

      default:
        throw new Error(`Unknown diff extraction type: ${type}`);
    }
  },

  /**
   * Analyze risk from a git diff
   */
  async analyzeRisk(input: DiffAnalysisInput): Promise<RiskAssessment> {
    const analyzer = new RiskAnalyzer();
    return analyzer.analyzeDiff(input);
  },
};
