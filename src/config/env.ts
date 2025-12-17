import dotenv from 'dotenv';

dotenv.config();

type Provider = 'GROQ' | 'OPENAI';

export interface LLMConfig {
  apiKey: string;
  baseURL?: string;
  provider: Provider;
}

export interface StdinConfig {
  timeoutMs: number;
  maxSizeBytes: number;
}

function parseNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function getLLMConfig(overrideApiKey?: string): LLMConfig {
  const provider = (process.env.LLM_PROVIDER?.toUpperCase() as Provider) || 'GROQ';

  let apiKey = overrideApiKey || '';
  let baseURL: string | undefined;

  if (provider === 'GROQ') {
    apiKey = apiKey || process.env.GROQ_API_KEY || '';
    baseURL = 'https://api.groq.com/openai/v1';
  } else {
    apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    baseURL = undefined; // Use OpenAI default
  }

  if (!apiKey) {
    const which = provider === 'GROQ' ? 'GROQ_API_KEY' : 'OPENAI_API_KEY';
    throw new Error(`API key is required. Set ${which} or pass --api-key.`);
  }

  return { apiKey, baseURL, provider };
}

export function getStdinConfig(): StdinConfig {
  return {
    timeoutMs: parseNumber(process.env.STDIN_TIMEOUT_MS, 30000),
    maxSizeBytes: parseNumber(process.env.STDIN_MAX_SIZE_BYTES, 10 * 1024 * 1024)
  };
}
