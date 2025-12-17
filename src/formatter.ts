/**
 * Beautiful JSON formatter with colors for CLI output
 */

import chalk from 'chalk';
import { RiskAssessment, RiskLevel, MigrationRisk } from './types';

/**
 * Get color for risk level
 */
function getRiskLevelColor(level: RiskLevel) {
  switch (level) {
    case 'LOW':
      return chalk.green;
    case 'MEDIUM':
      return chalk.yellow;
    case 'HIGH':
      return chalk.red;
    default:
      return chalk.white;
  }
}

/**
 * Get color for migration risk
 */
function getMigrationRiskColor(risk: MigrationRisk) {
  switch (risk) {
    case 'NONE':
      return chalk.green;
    case 'LOW':
      return chalk.yellow;
    case 'HIGH':
      return chalk.red;
    default:
      return chalk.white;
  }
}

/**
 * Format risk assessment with beautiful colors
 */
export function formatRiskAssessment(assessment: RiskAssessment): string {
  const lines: string[] = [];
  
  // Header
  lines.push(chalk.bold.cyan('╔═══════════════════════════════════════════════════════════╗'));
  lines.push(chalk.bold.cyan('║') + chalk.bold.white('  PR Risk Assessment Report') + chalk.bold.cyan('                          ║'));
  lines.push(chalk.bold.cyan('╚═══════════════════════════════════════════════════════════╝'));
  lines.push('');

  // Risk Level
  const riskColor = getRiskLevelColor(assessment.risk_level);
  lines.push(chalk.bold('Risk Level:') + ' ' + riskColor.bold(assessment.risk_level));
  lines.push('');

  // Risk Summary
  lines.push(chalk.bold.cyan('📋 Summary:'));
  lines.push(chalk.gray('  ') + assessment.risk_summary);
  lines.push('');

  // Risk Factors
  if (assessment.risk_factors.length > 0) {
    lines.push(chalk.bold.red('⚠️  Risk Factors:'));
    assessment.risk_factors.forEach((factor) => {
      lines.push(chalk.gray('  ') + chalk.red('  • ') + factor);
    });
    lines.push('');
  }

  // Reviewer Focus Areas
  if (assessment.reviewer_focus_areas.length > 0) {
    lines.push(chalk.bold.blue('👀 Reviewer Focus Areas:'));
    assessment.reviewer_focus_areas.forEach((area) => {
      lines.push(chalk.gray('  ') + chalk.blue('  • ') + area);
    });
    lines.push('');
  }

  // Missing Tests
  lines.push(chalk.bold('Missing Tests:') + ' ' + 
    (assessment.missing_tests ? chalk.red.bold('YES ⚠️') : chalk.green.bold('NO ✓')));
  lines.push('');

  // Migration Risk
  const migrationColor = getMigrationRiskColor(assessment.migration_risk);
  lines.push(chalk.bold('Migration Risk:') + ' ' + migrationColor.bold(assessment.migration_risk));
  lines.push('');

  // Footer
  lines.push(chalk.bold.cyan('╔═══════════════════════════════════════════════════════════╗'));
  lines.push(chalk.bold.cyan('╚═══════════════════════════════════════════════════════════╝'));

  return lines.join('\n');
}

/**
 * Format risk assessment as JSON with syntax highlighting
 */
export function formatRiskAssessmentJSON(assessment: RiskAssessment): string {
  const lines: string[] = [];
  
  lines.push(chalk.gray('{'));
  
  // risk_level
  const riskColor = getRiskLevelColor(assessment.risk_level);
  lines.push('  ' + chalk.cyan('"risk_level"') + ': ' + riskColor(`"${assessment.risk_level}"`) + ',');
  
  // risk_summary
  lines.push('  ' + chalk.cyan('"risk_summary"') + ': ' + chalk.green(`"${assessment.risk_summary}"`) + ',');
  
  // risk_factors
  lines.push('  ' + chalk.cyan('"risk_factors"') + ': ' + chalk.gray('['));
  assessment.risk_factors.forEach((factor, index) => {
    const comma = index < assessment.risk_factors.length - 1 ? ',' : '';
    lines.push('    ' + chalk.green(`"${factor}"`) + comma);
  });
  lines.push('  ' + chalk.gray(']') + ',');
  
  // reviewer_focus_areas
  lines.push('  ' + chalk.cyan('"reviewer_focus_areas"') + ': ' + chalk.gray('['));
  assessment.reviewer_focus_areas.forEach((area, index) => {
    const comma = index < assessment.reviewer_focus_areas.length - 1 ? ',' : '';
    lines.push('    ' + chalk.green(`"${area}"`) + comma);
  });
  lines.push('  ' + chalk.gray(']') + ',');
  
  // missing_tests
  const testColor = assessment.missing_tests ? chalk.red : chalk.green;
  lines.push('  ' + chalk.cyan('"missing_tests"') + ': ' + testColor(String(assessment.missing_tests)) + ',');
  
  // migration_risk
  const migrationColor = getMigrationRiskColor(assessment.migration_risk);
  lines.push('  ' + chalk.cyan('"migration_risk"') + ': ' + migrationColor(`"${assessment.migration_risk}"`));
  
  lines.push(chalk.gray('}'));
  
  return lines.join('\n');
}

