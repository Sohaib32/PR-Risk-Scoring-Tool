/**
 * LLM-based risk analyzer for PR diffs
 */

import OpenAI from 'openai';
import { RiskAssessment, DiffAnalysisInput } from './types';
import { RiskSchema } from './schema';
import { getLLMConfig } from './config/env';
import { logger } from './utils/logger';

// Maximum diff size to prevent token limit issues (approximately 100KB)
const MAX_DIFF_SIZE = 100 * 1024;

/**
 * RiskAnalyzer class for analyzing git diffs and assessing production risk
 * Uses Groq's LLM API (via OpenAI SDK) to analyze code changes
 */
export class RiskAnalyzer {
  private openai: OpenAI;

  /**
   * Creates a new RiskAnalyzer instance
   * @param apiKey - Optional Groq API key. If not provided, will use GROQ_API_KEY or OPENAI_API_KEY from environment
   * @throws Error if no API key is provided
   */
  constructor(apiKey?: string) {
    const { apiKey: resolvedKey, baseURL, provider } = getLLMConfig(apiKey);
    logger.debug(`Using LLM provider: ${provider}${baseURL ? ' (custom baseURL)' : ''}`);
    this.openai = new OpenAI({ apiKey: resolvedKey, baseURL });
  }

  /**
   * Analyze a git diff for production risk
   * @param input - The diff and optional PR context
   * @returns A validated risk assessment
   * @throws Error if diff is empty, too large, or analysis fails
   */
  async analyzeDiff(input: DiffAnalysisInput): Promise<RiskAssessment> {
    // Validate input
    if (!input.diff || input.diff.trim().length === 0) {
      throw new Error('Diff cannot be empty');
    }

    if (input.diff.length > MAX_DIFF_SIZE) {
      throw new Error(
        `Diff is too large (${Math.round(input.diff.length / 1024)}KB). ` +
        `Maximum size is ${MAX_DIFF_SIZE / 1024}KB. Consider analyzing smaller chunks.`
      );
    }

    const prompt = this.buildPrompt(input);
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
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
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from LLM');
      }

      // Parse and validate the JSON response using Zod
      const assessment = this.parseAndValidate(content);
      return assessment;
    } catch (error) {
      if (error instanceof Error) {
        // Preserve Zod validation errors
        if (error.message.includes('Required') || error.message.includes('Invalid enum')) {
          throw new Error(`Invalid response format from LLM: ${error.message}`);
        }
        throw new Error(`Risk analysis failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Builds the prompt for LLM analysis
   * @param input - The diff and optional PR context
   * @returns The formatted prompt string
   */
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

  /**
   * Parse and validate LLM response using Zod schema
   * @param content - Raw content from LLM
   * @returns Validated risk assessment
   * @throws Error if content cannot be parsed or validated
   */
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Invalid JSON response: ${errorMessage}. Content: ${content.substring(0, 200)}...`);
    }

    // Validate using Zod schema
    try {
      return RiskSchema.parse(parsed) as RiskAssessment;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
      throw new Error(`Response validation failed: ${errorMessage}`);
    }
  }
}
