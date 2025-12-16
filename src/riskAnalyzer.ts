/**
 * LLM-based risk analyzer for PR diffs
 */

import OpenAI from 'openai';
import { RiskAssessment, DiffAnalysisInput } from './types';

export class RiskAnalyzer {
  private openai: OpenAI;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error('OpenAI API key is required. Set OPENAI_API_KEY environment variable.');
    }
    this.openai = new OpenAI({ apiKey: key });
  }

  /**
   * Analyze a git diff for production risk
   */
  async analyzeDiff(input: DiffAnalysisInput): Promise<RiskAssessment> {
    const prompt = this.buildPrompt(input);
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert code reviewer analyzing production risk. Return only valid JSON with no additional text or markdown formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from LLM');
      }

      // Parse and validate the JSON response
      const assessment = this.parseAndValidate(content);
      return assessment;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Risk analysis failed: ${error.message}`);
      }
      throw error;
    }
  }

  private buildPrompt(input: DiffAnalysisInput): string {
    let prompt = `Analyze this git diff for production risk. Focus on critical paths, tests, migrations, and runtime impact.

Git Diff:
\`\`\`
${input.diff}
\`\`\`
`;

    if (input.prTitle) {
      prompt += `\nPR Title: ${input.prTitle}`;
    }

    if (input.prDescription) {
      prompt += `\nPR Description: ${input.prDescription}`;
    }

    prompt += `

Return ONLY valid JSON (no markdown, no extra text) with this exact structure:
{
  "risk_level": "LOW|MEDIUM|HIGH",
  "risk_summary": "concise, actionable summary (1-2 sentences)",
  "risk_factors": ["specific risk 1", "specific risk 2"],
  "reviewer_focus_areas": ["area to review 1", "area to review 2"],
  "missing_tests": true|false,
  "migration_risk": "NONE|LOW|HIGH"
}

Guidelines:
- risk_level: LOW for minor changes, MEDIUM for significant logic changes, HIGH for critical path/breaking changes
- risk_summary: Be specific and actionable, don't restate the diff
- risk_factors: List concrete risks (e.g., "Database schema change without rollback plan")
- reviewer_focus_areas: Where reviewers should focus (e.g., "Error handling in payment flow")
- missing_tests: true if code changes lack corresponding test updates
- migration_risk: NONE (no migrations), LOW (backward compatible), HIGH (breaking changes/data migration)

Keep it concise and human-readable.`;

    return prompt;
  }

  private parseAndValidate(content: string): RiskAssessment {
    // Remove markdown code blocks if present
    let cleaned = content.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch (error) {
      throw new Error(`Invalid JSON response: ${content}`);
    }

    // Ensure parsed is an object
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Response must be a JSON object');
    }

    // Validate structure
    const requiredFields = [
      'risk_level',
      'risk_summary',
      'risk_factors',
      'reviewer_focus_areas',
      'missing_tests',
      'migration_risk'
    ];

    for (const field of requiredFields) {
      if (!(field in parsed)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Cast to record for easier access
    const record = parsed as Record<string, unknown>;

    // Validate enums
    const validRiskLevels = ['LOW', 'MEDIUM', 'HIGH'];
    if (!validRiskLevels.includes(record.risk_level as string)) {
      throw new Error(`Invalid risk_level: ${record.risk_level}`);
    }

    const validMigrationRisks = ['NONE', 'LOW', 'HIGH'];
    if (!validMigrationRisks.includes(record.migration_risk as string)) {
      throw new Error(`Invalid migration_risk: ${record.migration_risk}`);
    }

    // Validate types
    if (typeof record.risk_summary !== 'string') {
      throw new Error('risk_summary must be a string');
    }

    if (!Array.isArray(record.risk_factors)) {
      throw new Error('risk_factors must be an array');
    }

    if (!Array.isArray(record.reviewer_focus_areas)) {
      throw new Error('reviewer_focus_areas must be an array');
    }

    if (typeof record.missing_tests !== 'boolean') {
      throw new Error('missing_tests must be a boolean');
    }

    return record as unknown as RiskAssessment;
  }
}
