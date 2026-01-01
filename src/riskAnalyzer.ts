/**
 * LLM-based risk analyzer for PR diffs
 */

import OpenAI from "openai";
import { RiskAssessment, DiffAnalysisInput, MigrationRisk } from "./types";
import { RiskSchema } from "./schema";
import { getLLMConfig } from "./config/env";
import { logger } from "./utils/logger";

// Maximum diff size to prevent token limit issues
// Groq free tier: 12000 tokens/minute for some models, up to 30000 for others
// OpenAI: Much higher limits (128K context for gpt-4o-mini)
// Conservative limit: 30KB for Groq, but can be overridden via env
const DEFAULT_MAX_DIFF_SIZE = 30 * 1024; // 30KB default

function getMaxDiffSize(): number {
  const envLimit = process.env.MAX_DIFF_SIZE_KB;
  if (envLimit) {
    const kb = Number(envLimit);
    if (!isNaN(kb) && kb > 0) {
      return kb * 1024;
    }
  }
  return DEFAULT_MAX_DIFF_SIZE;
}

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
  private model: string;

  constructor(apiKey?: string) {
    const { apiKey: resolvedKey, baseURL, provider, model } = getLLMConfig(apiKey);
    this.model = model || (provider === 'GROQ' ? 'llama-3.1-8b-instant' : 'gpt-4o-mini');
    logger.debug(
      `Using LLM provider: ${provider}, model: ${this.model}${baseURL ? " (custom baseURL)" : ""}`
    );
    this.openai = new OpenAI({ apiKey: resolvedKey, baseURL });
  }

  /**
   * Split a large diff into smaller chunks by file boundaries
   * @param diff - The git diff string
   * @param maxChunkSize - Maximum size per chunk in bytes
   * @returns Array of diff chunks
   */
  private splitDiffIntoChunks(diff: string, maxChunkSize: number): string[] {
    const chunks: string[] = [];
    const lines = diff.split('\n');
    let currentChunk: string[] = [];
    let currentSize = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineSize = line.length + 1; // +1 for newline

      // If adding this line would exceed the limit and we have content, start a new chunk
      if (currentSize + lineSize > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.join('\n'));
        currentChunk = [];
        currentSize = 0;
      }

      // Start new chunk on file boundary (diff --git)
      if (line.startsWith('diff --git')) {
        // If we have content, save it and start fresh
        if (currentChunk.length > 0) {
          chunks.push(currentChunk.join('\n'));
          currentChunk = [];
          currentSize = 0;
        }
      }

      currentChunk.push(line);
      currentSize += lineSize;
    }

    // Add remaining chunk
    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join('\n'));
    }

    return chunks.filter(chunk => chunk.trim().length > 0);
  }

  /**
   * Combine multiple risk assessments into a single assessment
   * @param assessments - Array of risk assessments to combine
   * @returns Combined risk assessment
   */
  /**
   * Create a fallback assessment when all chunks fail
   */
  private createFallbackAssessment(diffSize: number): RiskAssessment {
    return {
      risk_level: 'MEDIUM',
      risk_summary: `Large diff (${Math.round(diffSize / 1024)}KB) could not be fully analyzed due to API token limits. Manual review recommended.`,
      risk_factors: [
        'Diff too large for automated analysis',
        'API token limits exceeded',
        'Consider analyzing specific files or switching to OpenAI provider'
      ],
      reviewer_focus_areas: [
        'Review all changes manually',
        'Check for breaking changes',
        'Verify test coverage',
        'Review database migrations if any'
      ],
      missing_tests: true, // Conservative default
      migration_risk: 'NONE',
    };
  }

  private combineAssessments(assessments: RiskAssessment[]): RiskAssessment {
    if (assessments.length === 0) {
      // This shouldn't happen (we check before calling), but return fallback just in case
      logger.warn("combineAssessments called with empty array, returning fallback");
      return this.createFallbackAssessment(0);
    }

    if (assessments.length === 1) {
      return assessments[0];
    }

    // Risk level priority: HIGH > MEDIUM > LOW
    const riskLevelOrder: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };
    const highestRisk = assessments.reduce((max, assessment) => {
      return riskLevelOrder[assessment.risk_level] > riskLevelOrder[max.risk_level]
        ? assessment
        : max;
    });

    // Combine all risk factors and focus areas (deduplicate)
    const allRiskFactors = new Set<string>();
    const allFocusAreas = new Set<string>();
    let anyMissingTests = false;
    const migrationRisks: MigrationRisk[] = [];

    assessments.forEach(assessment => {
      assessment.risk_factors.forEach(factor => allRiskFactors.add(factor));
      assessment.reviewer_focus_areas.forEach(area => allFocusAreas.add(area));
      if (assessment.missing_tests) anyMissingTests = true;
      if (assessment.migration_risk !== 'NONE') {
        migrationRisks.push(assessment.migration_risk);
      }
    });

    // Determine combined migration risk
    let combinedMigrationRisk: MigrationRisk = 'NONE';
    if (migrationRisks.includes('HIGH')) {
      combinedMigrationRisk = 'HIGH';
    } else if (migrationRisks.includes('LOW')) {
      combinedMigrationRisk = 'LOW';
    }

    // Create combined summary
    const chunkCount = assessments.length;
    const summary = chunkCount > 1
      ? `Analyzed ${chunkCount} file chunks. ${highestRisk.risk_summary}`
      : highestRisk.risk_summary;

    return {
      risk_level: highestRisk.risk_level,
      risk_summary: summary,
      risk_factors: Array.from(allRiskFactors),
      reviewer_focus_areas: Array.from(allFocusAreas),
      missing_tests: anyMissingTests,
      migration_risk: combinedMigrationRisk,
    };
  }

  /**
   * Analyze a git diff for production risk
   * @param input - The diff and optional PR context
   * @param enableChunking - Whether to automatically chunk large diffs (default: true)
   * @returns A validated risk assessment
   * @throws Error if diff is empty, too large, or analysis fails
   */
  async analyzeDiff(input: DiffAnalysisInput, enableChunking: boolean = true): Promise<RiskAssessment> {
    // Validate input
    if (!input.diff || input.diff.trim().length === 0) {
      throw new Error("Diff cannot be empty");
    }

    const maxDiffSize = getMaxDiffSize();
    const diffSize = input.diff.length;

    // If diff is too large, try chunking
    // Use a very conservative chunk size (5KB) to account for prompt overhead and token limits
    // The prompt itself adds ~2-3KB, so 5KB diff + prompt ≈ 7-8KB total ≈ 2000 tokens (very safe)
    const safeChunkSize = Math.min(maxDiffSize, 5 * 1024); // 5KB max per chunk

    if (diffSize > safeChunkSize && enableChunking) {
      logger.info(`Diff is large (${Math.round(diffSize / 1024)}KB), splitting into chunks for analysis`);
      
      const chunks = this.splitDiffIntoChunks(input.diff, safeChunkSize);
      logger.info(`Split diff into ${chunks.length} chunks (max ${Math.round(safeChunkSize / 1024)}KB per chunk)`);

      if (chunks.length === 0) {
        throw new Error("Failed to split diff into chunks");
      }

      // Analyze each chunk
      const assessments: RiskAssessment[] = [];
      for (let i = 0; i < chunks.length; i++) {
        logger.info(`Analyzing chunk ${i + 1}/${chunks.length} (${Math.round(chunks[i].length / 1024)}KB)`);
        const chunkInput: DiffAnalysisInput = {
          diff: chunks[i],
          prTitle: input.prTitle ? `${input.prTitle} (chunk ${i + 1}/${chunks.length})` : undefined,
          prDescription: input.prDescription,
        };
        
        try {
          // Try analyzing chunk (with chunking enabled for recursive splitting if needed)
          const assessment = await this.analyzeDiff(chunkInput, true);
          assessments.push(assessment);
        } catch (chunkError: any) {
          // If chunk still fails, try splitting it further
          if (chunkError.message && (chunkError.message.includes("too large") || chunkError.message.includes("token"))) {
            logger.warn(`Chunk ${i + 1} (${Math.round(chunks[i].length / 1024)}KB) still too large, splitting further`);
            const smallerChunkSize = Math.max(safeChunkSize / 4, 2 * 1024); // Split into 1.25KB or 2KB chunks, whichever is larger
            const subChunks = this.splitDiffIntoChunks(chunks[i], smallerChunkSize);
            logger.info(`Split chunk ${i + 1} into ${subChunks.length} sub-chunks (max ${Math.round(smallerChunkSize / 1024)}KB each)`);
            
            for (let j = 0; j < subChunks.length; j++) {
              logger.info(`Analyzing sub-chunk ${i + 1}.${j + 1}/${subChunks.length} (${Math.round(subChunks[j].length / 1024)}KB)`);
              const subChunkInput: DiffAnalysisInput = {
                diff: subChunks[j],
                prTitle: input.prTitle ? `${input.prTitle} (chunk ${i + 1}.${j + 1})` : undefined,
                prDescription: input.prDescription,
              };
              // Keep chunking enabled for sub-chunks, but with even smaller limit
              // This allows further splitting if needed, but with a safety check
              try {
                const subAssessment = await this.analyzeDiff(subChunkInput, true);
                assessments.push(subAssessment);
              } catch (subChunkError: any) {
                // If even sub-chunk fails, log and skip (or try one more time with minimal size)
                if (subChunkError.message && (subChunkError.message.includes("too large") || subChunkError.message.includes("token"))) {
                  logger.error(`Sub-chunk ${i + 1}.${j + 1} still too large even after splitting. Size: ${Math.round(subChunks[j].length / 1024)}KB. This may be a very dense file. Skipping this chunk.`);
                  // Skip this chunk rather than failing entirely
                  continue;
                } else {
                  throw subChunkError;
                }
              }
            }
          } else {
            // Re-throw if it's a different error
            throw chunkError;
          }
        }
      }

      // Combine assessments
      if (assessments.length === 0) {
        logger.warn(`All chunks failed to analyze. Returning fallback assessment.`);
        return this.createFallbackAssessment(diffSize);
      }
      
      logger.info(`Combining ${assessments.length} chunk assessments`);
      return this.combineAssessments(assessments);
    }

    // If still too large and chunking disabled or not enabled, throw error
    if (diffSize > maxDiffSize) {
      throw new Error(
        `Diff is too large (${Math.round(diffSize / 1024)}KB). ` +
          `Maximum size is ${maxDiffSize / 1024}KB to avoid API token limits. ` +
          `Chunking is disabled. Enable chunking or analyze smaller chunks manually. ` +
          `Tip: Use \`git diff main..HEAD -- path/to/file\` to analyze specific files.`
      );
    }

    const prompt = this.buildPrompt(input);

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "You are an expert code reviewer analyzing production risk. Return only valid JSON with no additional text or markdown formatting.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from LLM");
      }

      // Parse and validate the JSON response using Zod
      const assessment = this.parseAndValidate(content);
      return assessment;
    } catch (error: any) {
      if (error instanceof Error) {
        // Handle API rate limit / size limit errors
        // Check both error message and status code (OpenAI SDK wraps errors)
        const errorMessage = error.message || '';
        const errorStatus = (error as any).status || (error as any).response?.status;
        const isSizeLimitError = 
          errorMessage.includes("413") ||
          errorMessage.includes("Request too large") ||
          errorMessage.includes("tokens per minute") ||
          errorMessage.includes("TPM") ||
          errorMessage.includes("too large") ||
          errorStatus === 413;
        
        if (isSizeLimitError) {
          throw new Error(
            `Diff is too large for the LLM API. ` +
              `Current size: ${Math.round(input.diff.length / 1024)}KB. ` +
              `The API rejected this size due to token limits. ` +
              `Solutions: ` +
              `1) Analyze smaller chunks: git diff main..HEAD -- path/to/file | npx ts-node src/cli.ts --stdin ` +
              `2) Switch to OpenAI: Set LLM_PROVIDER=OPENAI and OPENAI_API_KEY in .env ` +
              `3) Increase MAX_DIFF_SIZE_KB=200 in .env (may still hit limits with Groq)`
          );
        }
        
        // Preserve Zod validation errors
        if (
          error.message.includes("Required") ||
          error.message.includes("Invalid enum")
        ) {
          throw new Error(`Invalid response format from LLM: ${error.message}`);
        }
        throw new Error(`Risk analysis failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Check if the diff contains changes to test files
   * @param diff - The git diff string
   * @returns true if test files are modified, false otherwise
   */
  private hasTestChanges(diff: string): boolean {
    const testPatterns = [
      /^diff --git a\/.*\.test\./m,
      /^diff --git a\/.*\.spec\./m,
      /^diff --git a\/.*\/__tests__\//m,
      /^diff --git a\/tests\//m,
      /^diff --git a\/test\//m,
    ];
    return testPatterns.some((pattern) => pattern.test(diff));
  }

  /**
   * Builds the prompt for LLM analysis
   * @param input - The diff and optional PR context
   * @returns The formatted prompt string
   */
  private buildPrompt(input: DiffAnalysisInput): string {
    // Much shorter prompt to reduce token usage
    let prompt = `Analyze git diff for production risk. Return JSON only:\n\n`;
    
    if (input.prTitle) {
      prompt += `PR: ${input.prTitle}\n`;
    }
    
    prompt += `Diff:\n${input.diff}\n\n`;
    
    prompt += `JSON format: {"risk_level":"LOW|MEDIUM|HIGH","risk_summary":"summary","risk_factors":["risk1"],"reviewer_focus_areas":["area1"],"missing_tests":true|false,"migration_risk":"NONE|LOW|HIGH"}`;

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
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `Invalid JSON response: ${errorMessage}. Content: ${content.substring(
          0,
          200
        )}...`
      );
    }

    // Validate using Zod schema
    try {
      return RiskSchema.parse(parsed) as RiskAssessment;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown validation error";
      throw new Error(`Response validation failed: ${errorMessage}`);
    }
  }
}
