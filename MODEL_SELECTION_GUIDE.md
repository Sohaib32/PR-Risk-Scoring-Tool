# Model Selection Guide

## Quick Model Switching

If you're getting token limit errors, you can switch models or providers.

## Groq Models

### Default: `llama-3.1-8b-instant`
- **Speed**: Very fast
- **Token Limit**: ~30,000 tokens/minute (free tier)
- **Best for**: Quick analyses, smaller diffs
- **Set in .env**: `GROQ_MODEL=llama-3.1-8b-instant`

### Alternative: `llama-3.3-70b-versatile`
- **Speed**: Slower but better quality
- **Token Limit**: ~12,000 tokens/minute (free tier) ⚠️
- **Best for**: Higher quality analysis, smaller diffs
- **Set in .env**: `GROQ_MODEL=llama-3.3-70b-versatile`

## OpenAI Models (Higher Limits)

### Default: `gpt-4o-mini`
- **Speed**: Fast
- **Token Limit**: 128K context window (much larger!)
- **Cost**: Very affordable
- **Best for**: Large diffs, production use
- **Set in .env**: 
  ```bash
  LLM_PROVIDER=OPENAI
  OPENAI_API_KEY=your-key
  OPENAI_MODEL=gpt-4o-mini
  ```

### Alternative: `gpt-4o`
- **Speed**: Moderate
- **Token Limit**: 128K context window
- **Cost**: Higher
- **Best for**: Best quality, large diffs
- **Set in .env**: `OPENAI_MODEL=gpt-4o`

## How to Switch

### Option 1: Switch Groq Model (Stay with Groq)

Edit `.env`:
```bash
GROQ_MODEL=llama-3.1-8b-instant  # Better for larger diffs
```

### Option 2: Switch to OpenAI (Best for Large Diffs)

Edit `.env`:
```bash
LLM_PROVIDER=OPENAI
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini
```

### Option 3: Increase Size Limit

If you have a higher API tier, increase the limit:
```bash
MAX_DIFF_SIZE_KB=100  # Allow up to 100KB diffs
```

## Recommendations

| Use Case | Recommended Model | Why |
|----------|------------------|-----|
| Small diffs (<30KB) | `llama-3.1-8b-instant` | Fast, free, sufficient |
| Medium diffs (30-100KB) | `gpt-4o-mini` (OpenAI) | Large context, affordable |
| Large diffs (>100KB) | `gpt-4o-mini` (OpenAI) | 128K context window |
| Best quality | `gpt-4o` (OpenAI) | Highest quality analysis |
| Free tier only | `llama-3.1-8b-instant` | Best Groq option for size |

## Troubleshooting

### "Request too large" Error

1. **Switch to OpenAI** (easiest):
   ```bash
   LLM_PROVIDER=OPENAI
   OPENAI_API_KEY=your-key
   ```

2. **Or use smaller model**:
   ```bash
   GROQ_MODEL=llama-3.1-8b-instant
   ```

3. **Or analyze smaller chunks**:
   ```bash
   git diff main..HEAD -- src/specific/file.ts | npx ts-node src/cli.ts --stdin
   ```

### "Token limit" Error

- Groq free tier has strict limits
- Switch to OpenAI for much higher limits
- Or upgrade Groq to Dev Tier

## Quick Test

Test with a sample file first:
```bash
npx ts-node src/temporal/cli.ts start --file examples/sample-diff.txt --wait
```

If that works, your model/config is fine. The issue is just the diff size.
