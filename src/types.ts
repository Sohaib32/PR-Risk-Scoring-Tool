/**
 * Core types for PR risk assessment
 */

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type MigrationRisk = 'NONE' | 'LOW' | 'HIGH';

export interface RiskAssessment {
  risk_level: RiskLevel;
  risk_summary: string;
  risk_factors: string[];
  reviewer_focus_areas: string[];
  missing_tests: boolean;
  migration_risk: MigrationRisk;
}

export interface DiffAnalysisInput {
  diff: string;
  prTitle?: string;
  prDescription?: string;
}
