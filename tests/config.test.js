const test = require('node:test');
const assert = require('node:assert/strict');

// Mock environment for testing
process.env.GROQ_API_KEY = 'test-key-123';
process.env.LLM_PROVIDER = 'GROQ';

const path = require('node:path');
const { getLLMConfig } = require(path.resolve(process.cwd(), 'dist', 'config', 'env.js'));

test('getLLMConfig returns GROQ config by default', () => {
  const config = getLLMConfig();
  assert.equal(config.provider, 'GROQ');
  assert.equal(config.apiKey, 'test-key-123');
  // Verify the baseURL is the exact Groq endpoint
  assert.equal(config.baseURL, 'https://api.groq.com/openai/v1');
});

test('getLLMConfig accepts override API key', () => {
  const config = getLLMConfig('override-key');
  assert.equal(config.apiKey, 'override-key');
});

test('getLLMConfig throws error when API key is missing', () => {
  const originalKey = process.env.GROQ_API_KEY;
  delete process.env.GROQ_API_KEY;
  delete process.env.OPENAI_API_KEY;
  
  assert.throws(
    () => getLLMConfig(),
    /API key is required/
  );
  
  process.env.GROQ_API_KEY = originalKey;
});

test('getLLMConfig validates provider value', () => {
  const originalProvider = process.env.LLM_PROVIDER;
  process.env.LLM_PROVIDER = 'INVALID';
  
  assert.throws(
    () => getLLMConfig(),
    /Invalid LLM provider/
  );
  
  process.env.LLM_PROVIDER = originalProvider;
});
