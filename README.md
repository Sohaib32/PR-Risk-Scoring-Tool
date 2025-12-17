# PR Risk Scoring Tool

An AI-powered tool that analyzes pull request diffs and produces risk assessments with actionable reviewer guidance using Groq's Llama models.

> **🚀 New here?** Check out [GETTING_STARTED.md](GETTING_STARTED.md) for a super simple step-by-step guide with real examples!

## Features

- 🤖 **LLM-Powered Analysis**: Uses Groq's Llama 3.3 70B model for intelligent code review
- 🎯 **Production Risk Assessment**: Evaluates critical paths, tests, migrations, and runtime impact
- 📊 **Structured Output**: Returns consistent, machine-readable JSON or beautiful formatted reports
- 🔄 **Multiple Input Methods**: Supports git branches, files, stdin, or uncommitted changes
- 💡 **Actionable Insights**: Provides specific risk factors and reviewer focus areas
- 🎨 **Beautiful CLI Output**: Colored, formatted reports for easy reading

## Quick Start

### 1. Installation

```bash
npm install
npm run build
```

### 2. Configuration

Get a Groq API key from https://console.groq.com/ and set it:

**Using .env file (Recommended):**
```bash
cp .env.example .env
# Edit .env and add: GROQ_API_KEY=your-key-here
```

**Or set environment variable:**
```bash
# PowerShell
$env:GROQ_API_KEY="your-key-here"

# Bash
export GROQ_API_KEY='your-key-here'
```

### 3. Run Your First Analysis

```bash
# Show help
npm start

# Analyze sample diff
npx ts-node src/cli.ts --file examples/sample-diff.txt

# Analyze uncommitted changes
npx ts-node src/cli.ts --uncommitted
```

## Usage

### CLI Commands

**Analyze between branches:**
```bash
npx ts-node src/cli.ts --base main --head feature-branch
```

**Analyze from file:**
```bash
npx ts-node src/cli.ts --file path/to/diff.txt
```

**Analyze from stdin:**
```bash
git diff main..feature | npx ts-node src/cli.ts --stdin
```

**Analyze uncommitted changes:**
```bash
npx ts-node src/cli.ts --uncommitted
```

**With PR context for better analysis:**
```bash
npx ts-node src/cli.ts --base main --head feature \
  --title "Add payment retry logic" \
  --description "Implements exponential backoff for failed payments"
```

**Different output formats:**
```bash
# Beautiful formatted report (default)
npx ts-node src/cli.ts --file diff.txt --format beautiful

# Colored JSON
npx ts-node src/cli.ts --file diff.txt --format pretty

# Raw JSON
npx ts-node src/cli.ts --file diff.txt --format json
```

### After Building

```bash
npm run build

# Use built version
node scripts/run.js --uncommitted
npm run analyze:uncommitted
```

### Programmatic Usage

```typescript
import { RiskAnalyzer, GitDiffExtractor } from 'pr-risk-scoring-tool';

// Initialize analyzer
const analyzer = new RiskAnalyzer(process.env.GROQ_API_KEY);

// Get diff
const extractor = new GitDiffExtractor();
const diff = await extractor.getDiff('main', 'feature-branch');

// Analyze
const assessment = await analyzer.analyzeDiff({ 
  diff,
  prTitle: "Add payment feature",
  prDescription: "Implements Stripe integration"
});

console.log(assessment);
```

## Output Format

The tool returns a structured JSON object:

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

### Field Descriptions

| Field | Description | Values |
|-------|-------------|--------|
| `risk_level` | Overall risk assessment | `LOW`, `MEDIUM`, `HIGH` |
| `risk_summary` | Brief, actionable summary of changes | string |
| `risk_factors` | Specific risks identified | array of strings |
| `reviewer_focus_areas` | Where reviewers should focus | array of strings |
| `missing_tests` | Whether tests are missing | boolean |
| `migration_risk` | Risk from migrations | `NONE`, `LOW`, `HIGH` |

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# LLM Provider (GROQ or OPENAI)
LLM_PROVIDER=GROQ

# API Keys (set one based on provider)
GROQ_API_KEY=your-groq-api-key-here
# OPENAI_API_KEY=your-openai-api-key-here

# Optional: Stdin behavior
STDIN_TIMEOUT_MS=30000          # 30 seconds
STDIN_MAX_SIZE_BYTES=10485760   # 10MB

# Optional: Logging
LOG_LEVEL=info                  # debug, info, warn, error
```

## Global Installation (Use in Any Repo)

To use this tool across all your projects:

```bash
# Build and link globally
npm run build
npm link

# Now use it anywhere!
cd /path/to/any-project
pr-risk-analyzer --uncommitted
pr-risk-analyzer --base main --head feature-branch
```

To uninstall:
```bash
npm unlink -g pr-risk-scoring-tool
```

## Development

**Build:**
```bash
npm run build
```

**Run tests:**
```bash
npm test
```

**Lint:**
```bash
npm run lint
```

**Development mode:**
```bash
npx ts-node src/cli.ts --help
```

## Troubleshooting

### "API key is required"
- Set `GROQ_API_KEY` environment variable
- Or create `.env` file with your key
- Or use `--api-key` flag

### "No diff content found"
- Ensure you're in a git repository for `--base/--head` or `--uncommitted`
- Check file path for `--file` option
- Verify there are actual changes to analyze

### "Diff is too large"
- The tool limits diffs to 100KB to prevent token issues
- Analyze smaller chunks or specific files
- Consider using `--base/--head` with specific commit ranges

### "Timeout waiting for stdin input"
- Increase timeout: `STDIN_TIMEOUT_MS=60000` in `.env`
- Ensure you're piping content correctly
- Check that stdin is not interactive (TTY)

## Examples

Check the `examples/` directory for:
- `sample-diff.txt` - Example git diff
- `expected-output.json` - Sample risk assessment
- `README.md` - More usage examples

## Architecture

- **RiskAnalyzer**: LLM-powered risk analysis with Groq/OpenAI
- **GitDiffExtractor**: Extracts diffs from git, files, or stdin
- **CLI**: Command-line interface with multiple modes
- **Formatter**: Beautiful colored output for terminal

## Security

- ✅ API keys never logged or exposed
- ✅ Input validation on all user data
- ✅ Type-safe TypeScript throughout
- ✅ Size limits prevent memory issues

## License

MIT

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.
