# Quick Start Guide

## Prerequisites

1. **Node.js** (v14 or higher)
2. **OpenAI API Key** - Get one from https://platform.openai.com/api-keys

## Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

Set your OpenAI API key:

```bash
export OPENAI_API_KEY='sk-...'
```

Or create a `.env` file (not recommended for production):

```bash
cp .env.example .env
# Edit .env and add your API key
```

## Basic Usage

### 1. Analyze a diff file

```bash
npm run dev -- --file examples/sample-diff.txt
```

### 2. Analyze changes between branches

```bash
npm run dev -- --base main --head feature-branch
```

### 3. Analyze uncommitted changes

```bash
npm run dev -- --uncommitted
```

### 4. Analyze from stdin (pipe diff)

```bash
git diff main..feature | npm run dev -- --stdin
```

### 5. Add PR context for better analysis

```bash
npm run dev -- \
  --base main \
  --head feature \
  --title "Add payment retry logic" \
  --description "Implements exponential backoff for failed payment attempts"
```

## Expected Output

The tool outputs a JSON object:

```json
{
  "risk_level": "MEDIUM",
  "risk_summary": "Payment processing modified with retry logic, no test coverage visible",
  "risk_factors": [
    "Critical payment flow modification without test updates",
    "Retry logic could mask underlying issues"
  ],
  "reviewer_focus_areas": [
    "Verify retry logic handles all edge cases",
    "Check test coverage for retry scenarios"
  ],
  "missing_tests": true,
  "migration_risk": "NONE"
}
```

## Understanding the Output

- **risk_level**: Overall risk (LOW, MEDIUM, or HIGH)
- **risk_summary**: Brief explanation of what changed and why it matters
- **risk_factors**: Specific concerns identified
- **reviewer_focus_areas**: What reviewers should pay attention to
- **missing_tests**: Whether tests are missing for the changes
- **migration_risk**: Risk from data/schema migrations (NONE, LOW, or HIGH)

## Tips

- **More context = better analysis**: Use `--title` and `--description` for more accurate risk assessment
- **Large diffs**: The tool works best on focused changes. Consider analyzing feature branches separately
- **Review the output**: The LLM may occasionally make mistakes. Use your judgment when acting on recommendations

## Troubleshooting

### "OpenAI API key is required"
- Make sure you've set the `OPENAI_API_KEY` environment variable
- Or use `--api-key` flag: `npm run dev -- --file diff.txt --api-key sk-...`

### "No diff content found"
- Ensure your git repository has changes
- Check that the file path is correct
- Verify you're in a git repository for `--base/--head` or `--uncommitted` options

### "Invalid JSON response"
- The LLM occasionally returns malformed JSON
- Try running the analysis again
- Consider simplifying the diff or adding more context

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [IMPLEMENTATION.md](IMPLEMENTATION.md) for architecture details
- See [examples/](examples/) for sample diffs and outputs
