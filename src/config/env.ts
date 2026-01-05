/**
 * Environment configuration utilities
 * 
 * This module handles loading and validating environment variables for LLM providers,
 * API keys, and other configuration settings. It supports both Groq and OpenAI providers.
 */

import dotenv from 'dotenv';

dotenv.config();

type Provider = 'GROQ' | 'OPENAI';

/**
 * Valid LLM providers
 */
const VALID_PROVIDERS: Provider[] = ['GROQ', 'OPENAI'];

/**
 * LLM configuration interface
 */
export interface LLMConfig {
  /** API key for the LLM provider */
  apiKey: string;
  /** Base URL for API requests (optional, uses provider default if not set) */
  baseURL?: string;
  /** The LLM provider being used */
  provider: Provider;
  /** The model to use for analysis */
  model?: string;
}

/**
 * Stdin configuration interface
 */
export interface StdinConfig {
  /** Timeout in milliseconds for stdin reads */
  timeoutMs: number;
  /** Maximum size in bytes for stdin input */
  maxSizeBytes: number;
}

/**
 * Parse a string as a positive number with fallback
 * @param value - String value to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed number or fallback
 */
function parseNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * Get LLM configuration from environment variables
 * 
 * Reads provider, API keys, and model selection from environment variables.
 * Supports both Groq and OpenAI providers with appropriate defaults.
 * 
 * @param overrideApiKey - Optional API key to override environment variable
 * @returns LLM configuration object
 * @throws {Error} If no API key is found for the selected provider
 * 
 * @example
 * ```typescript
 * // Use env vars
 * const config = getLLMConfig();
 * 
 * // Override with specific key
 * const config = getLLMConfig('my-api-key');
 * ```
 */
export function getLLMConfig(overrideApiKey?: string): LLMConfig {
  const providerStr = process.env.LLM_PROVIDER?.toUpperCase() || 'GROQ';
  
  // Validate provider using type-safe approach
  if (!VALID_PROVIDERS.includes(providerStr as Provider)) {
    throw new Error(`Invalid LLM provider: ${providerStr}. Must be one of: ${VALID_PROVIDERS.join(', ')}`);
  }
  
  const provider = providerStr as Provider;

  let apiKey = overrideApiKey || '';
  let baseURL: string | undefined;
  let model: string | undefined;

  if (provider === 'GROQ') {
    apiKey = apiKey || process.env.GROQ_API_KEY || '';
    baseURL = 'https://api.groq.com/openai/v1';
    // Default to llama-3.1-8b-instant for larger context, or use env var
    model = process.env.GROQ_MODEL || process.env.LLM_MODEL || 'llama-3.1-8b-instant';
  } else {
    apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    baseURL = undefined; // Use OpenAI default
    // Default to gpt-4o-mini for cost-effective large context
    model = process.env.OPENAI_MODEL || process.env.LLM_MODEL || 'gpt-4o-mini';
  }

  if (!apiKey) {
    const which = provider === 'GROQ' ? 'GROQ_API_KEY' : 'OPENAI_API_KEY';
    throw new Error(`API key is required. Set ${which} or pass --api-key.`);
  }

  return { apiKey, baseURL, provider, model };
}

/**
 * Get stdin configuration from environment variables
 * 
 * Reads timeout and size limits for stdin operations.
 * 
 * @returns Stdin configuration with timeout and max size
 * 
 * @example
 * ```typescript
 * const config = getStdinConfig();
 * console.log(config.timeoutMs);     // 30000 (default)
 * console.log(config.maxSizeBytes);  // 10485760 (10MB default)
 * ```
 */
export function getStdinConfig(): StdinConfig {
  return {
    timeoutMs: parseNumber(process.env.STDIN_TIMEOUT_MS, 30000),
    maxSizeBytes: parseNumber(process.env.STDIN_MAX_SIZE_BYTES, 10 * 1024 * 1024)
  };
}
