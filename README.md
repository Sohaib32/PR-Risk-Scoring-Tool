# PR Risk Scoring Tool

An AI-powered tool that analyzes pull request diffs and produces risk assessments with actionable reviewer guidance. Supports both direct execution and Temporal.io workflow orchestration for reliable, scalable analysis of large codebases.

> **🚀 New here?** Check out [GETTING_STARTED.md](GETTING_STARTED.md) for a super simple step-by-step guide with real examples!

## Features

- 🤖 **LLM-Powered Analysis**: Uses Groq/OpenAI models for intelligent code review
- 🎯 **Production Risk Assessment**: Evaluates critical paths, tests, migrations, and runtime impact
- 📊 **Structured Output**: Returns consistent, machine-readable JSON or beautiful formatted reports
- 🔄 **Multiple Input Methods**: Supports git branches, files, stdin, or uncommitted changes
- 💡 **Actionable Insights**: Provides specific risk factors and reviewer focus areas
- 🎨 **Beautiful CLI Output**: Colored, formatted reports for easy reading
- ⚡ **Temporal.io Integration**: Workflow orchestration with automatic retries, scalability, and observability
- 🔀 **Automatic Chunking**: Handles large diffs by automatically splitting into manageable chunks
- 🔧 **Model Selection**: Support for multiple LLM providers (Groq, OpenAI) with configurable models

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

# Launch interactive UI (menu-based)
npx ts-node src/cli.ts --ui
```

## Temporal.io Workflow Orchestration

The tool includes Temporal.io integration for reliable, scalable workflow orchestration. This is ideal for:
- High-volume analysis requests
- Production deployments
- Automatic retries and failure recovery
- Workflow observability
- Large diff analysis (automatic chunking)

> **🤔 New to Temporal?** Check out [TEMPORAL_SIMPLE_GUIDE.md](TEMPORAL_SIMPLE_GUIDE.md) for a beginner-friendly explanation!

### Quick Start with Temporal

**Prerequisites:** Docker Desktop must be running

1. **Start Temporal Server:**
   ```bash
   npm run temporal:start
   # Or on Windows:
   .\docker-run-temporal.ps1
   ```

2. **Start Worker (in separate terminal - keep running):**
   ```bash
   npm run temporal:worker
   ```

3. **Start a Workflow (in another terminal):**
   ```bash
   # Compare branches
   npx ts-node src/temporal/cli.ts start --base main --head feature-branch --wait
   
   # Analyze from file
   npx ts-node src/temporal/cli.ts start --file examples/sample-diff.txt --wait
   
   # Analyze uncommitted changes
   npx ts-node src/temporal/cli.ts start --uncommitted --wait
   ```

4. **View in Temporal UI:**
   Open http://localhost:8081 to monitor workflows

### Temporal Commands

**Start/Stop:**
```bash
npm run temporal:start    # Start Temporal server
npm run temporal:stop     # Stop Temporal server
npm run temporal:worker   # Start worker
npm run temporal:logs     # View logs
```

**Run Workflows:**
```bash
# Compare branches
npx ts-node src/temporal/cli.ts start --base main --head feature-branch --wait

# Analyze from file
npx ts-node src/temporal/cli.ts start --file diff.txt --wait

# Analyze uncommitted changes
npx ts-node src/temporal/cli.ts start --uncommitted --wait

# Get result later (without --wait)
npx ts-node src/temporal/cli.ts result <workflow-id>

# Cancel a workflow
npx ts-node src/temporal/cli.ts cancel <workflow-id>
```

### Temporal Documentation

- **[TEMPORAL_SIMPLE_GUIDE.md](TEMPORAL_SIMPLE_GUIDE.md)** - Beginner-friendly explanation
- **[TEMPORAL_SETUP.md](TEMPORAL_SETUP.md)** - Detailed setup and configuration
- **[TEMPORAL_UI_GUIDE.md](TEMPORAL_UI_GUIDE.md)** - UI usage guide
- **[TEMPORAL_QUICK_REFERENCE.md](TEMPORAL_QUICK_REFERENCE.md)** - Quick command reference
- **[TEMPORAL_HOW_IT_WORKS.md](TEMPORAL_HOW_IT_WORKS.md)** - Understanding UI vs Commands
- **[COMPARE_BRANCHES_TEMPORAL.md](COMPARE_BRANCHES_TEMPORAL.md)** - Complete guide for comparing branches

## Usage

### Standard CLI (Direct Execution)

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

**With PR title for better analysis:**
```bash
npx ts-node src/cli.ts --base main --head feature --title "Add payment retry logic"
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

**Interactive UI mode (menu-based):**
```bash
# TypeScript (dev)
npx ts-node src/cli.ts --ui

# Built JS
node scripts/run.js --ui
```

### Temporal Workflows (Recommended for Production)

For reliable, scalable analysis with automatic retries and monitoring:

```bash
# Compare branches
npx ts-node src/temporal/cli.ts start --base main --head feature-branch --wait

# Analyze from file
npx ts-node src/temporal/cli.ts start --file diff.txt --wait

# Analyze uncommitted changes
npx ts-node src/temporal/cli.ts start --uncommitted --wait
```

See [Temporal.io Workflow Orchestration](#temporalio-workflow-orchestration) section above for setup instructions.

### After Building

```bash
npm run build

# Use built version
node scripts/run.js --uncommitted
npm run analyze:uncommitted
```

### CI Integration

- **Fail pipeline on high risk:**

```bash
pr-risk-analyzer --base main --head $GITHUB_SHA --format json --fail-on-risk HIGH
```

- **Also fail when tests are missing:**

```bash
pr-risk-analyzer --base main --head $GITHUB_SHA --format json --fail-on-risk MEDIUM --fail-on-missing-tests
```

**Exit codes (for CI):**

- `0` – Analysis succeeded, thresholds not violated  
- `1` – CLI/tool error (invalid input, API failure, etc.)  
- `2` – Failed due to `risk_level` meeting or exceeding `--fail-on-risk`  
- `3` – Failed because tests are missing (`missing_tests` is `true`) and `--fail-on-missing-tests` is set, but the risk threshold is *not* violated (if the risk threshold is violated, exit code `2` is used)

### Programmatic Usage

#### Standard (Direct Execution)

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

#### Temporal Workflows

```typescript
import { startPRRiskAnalysis } from 'pr-risk-scoring-tool';

// Start a workflow
const { workflowId, result } = await startPRRiskAnalysis({
  diffSource: {
    type: 'branches',
    base: 'main',
    head: 'feature-branch'
  },
  prTitle: "Add payment feature",
  prDescription: "Implements Stripe integration"
});

// Wait for result
const output = await result;
console.log(output.assessment);
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

# Optional: Model selection
# For Groq: llama-3.1-8b-instant (default, faster), llama-3.3-70b-versatile (better quality)
GROQ_MODEL=llama-3.1-8b-instant
# For OpenAI: gpt-4o-mini (default, cost-effective), gpt-4o (better quality)
OPENAI_MODEL=gpt-4o-mini
# Or use LLM_MODEL to override for either provider
# LLM_MODEL=llama-3.1-8b-instant

# Optional: Diff size limit (in KB, default: 30KB)
# Large diffs are automatically chunked (5KB chunks)
# Increase for larger chunks (requires higher API tier)
MAX_DIFF_SIZE_KB=30

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

# Now use it anywhere (in any git repo)
cd /path/to/any-project

# Analyze uncommitted changes
pr-risk-analyzer --uncommitted

# Analyze between branches/commits
pr-risk-analyzer --base main --head feature-branch

# Analyze from a diff file
pr-risk-analyzer --file my-changes.diff

# Pipe git diff via stdin
git diff main..HEAD | pr-risk-analyzer --stdin

# Launch interactive UI (menu-based)
pr-risk-analyzer --ui
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

**Temporal development:**
```bash
# Start Temporal server
npm run temporal:start

# Start worker (in separate terminal)
npm run temporal:worker

# Run workflow
npm run temporal:workflow -- start --base main --head feature-branch --wait
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
- The tool automatically chunks large diffs (default: 5KB per chunk)
- For very large diffs, consider:
  - Switching to OpenAI provider (128K context window)
  - Analyzing specific files: `git diff main..HEAD -- path/to/file`
  - Increasing `MAX_DIFF_SIZE_KB` in `.env` (may still hit API limits with Groq)
- See [MODEL_SELECTION_GUIDE.md](MODEL_SELECTION_GUIDE.md) for model recommendations

### Temporal Issues

**"Connection refused"**
- Ensure Temporal server is running: `docker-compose ps`
- Wait 10-15 seconds after starting for initialization
- Check Docker Desktop is running

**"Worker failed"**
- Verify Temporal server is running
- Check API keys are set in `.env`
- Restart worker: Stop (Ctrl+C) and run `npm run temporal:worker` again

**"Workflow not found"**
- Make sure worker is running
- Check task queue name matches
- Verify workflow ID is correct

### "Timeout waiting for stdin input"
- Increase timeout: `STDIN_TIMEOUT_MS=60000` in `.env`
- Ensure you're piping content correctly
- Check that stdin is not interactive (TTY)

## Examples

Check the `examples/` directory for:
- `sample-diff.txt` - Example git diff
- `expected-output.json` - Sample risk assessment
- `README.md` - More usage examples

### Quick Examples

**Standard CLI:**
```bash
# Quick analysis
npx ts-node src/cli.ts --uncommitted

# Compare branches
npx ts-node src/cli.ts --base main --head feature-branch
```

**Temporal Workflows:**
```bash
# With monitoring and retries
npx ts-node src/temporal/cli.ts start --base main --head feature-branch --wait
```

**See also:**
- [COMPARE_BRANCHES_TEMPORAL.md](COMPARE_BRANCHES_TEMPORAL.md) - Complete branch comparison guide
- [TEMPORAL_QUICK_REFERENCE.md](TEMPORAL_QUICK_REFERENCE.md) - Quick command reference

## Architecture

### Core Components
- **RiskAnalyzer**: LLM-powered risk analysis with Groq/OpenAI, automatic chunking for large diffs
- **GitDiffExtractor**: Extracts diffs from git, files, or stdin with input validation
- **CLI**: Command-line interface with multiple modes (standard and Temporal)
- **Formatter**: Beautiful colored output for terminal

### Temporal Components
- **Workflows**: Orchestrate risk analysis process with retry logic
- **Activities**: Execute git diff extraction and risk analysis
- **Worker**: Background service that processes workflow tasks
- **Client**: Starts and manages workflows

### Key Features
- **Automatic Chunking**: Large diffs are automatically split into 5KB chunks
- **Recursive Splitting**: Failed chunks are split further automatically
- **Fallback Assessment**: Returns fallback when all chunks fail (instead of crashing)
- **Model Selection**: Support for multiple LLM providers and models
- **Input Validation**: Prevents path traversal and injection attacks
- **Security**: Built-in protections and best practices

## Best Practices

### Security
- Store API keys in `.env` file, never commit them
- Rotate API keys regularly
- Use separate keys for development and production
- Review the [SECURITY.md](SECURITY.md) for security guidelines
- Run `npm audit` regularly to check for vulnerabilities

### Performance
- For large diffs, consider using OpenAI provider (larger context window)
- Analyze specific files rather than entire branches when possible
- Use Temporal workflows for better reliability and observability
- Monitor API usage and costs

### Development
- Follow the [CONTRIBUTING.md](CONTRIBUTING.md) guidelines
- Write tests for new features
- Run `npm run lint` before committing
- Use the VS Code extensions we recommend
- Keep dependencies up to date

### CI/CD Integration
- Use `--fail-on-risk` to enforce quality gates
- Combine with `--fail-on-missing-tests` for test coverage checks
- Store API keys in CI secrets, not in repository
- Consider rate limits when running in CI
- Use JSON output format for easier parsing

## Security

- ✅ API keys never logged or exposed
- ✅ Input validation on all user data (prevents path traversal and injection)
- ✅ Type-safe TypeScript throughout
- ✅ Size limits prevent memory issues
- ✅ CodeQL security scanning enabled
- ✅ Dependabot monitors dependencies
- 📄 See [SECURITY.md](SECURITY.md) for security policy and vulnerability reporting

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Development workflow
- Coding standards
- Testing guidelines
- Pull request process
- Reporting bugs and requesting features

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes in each release.

## License

MIT

## Support

- 📖 [Getting Started Guide](GETTING_STARTED.md)
- 🔧 [Model Selection Guide](MODEL_SELECTION_GUIDE.md)
- ⏱️ [Temporal Simple Guide](TEMPORAL_SIMPLE_GUIDE.md)
- 🐛 [Report a Bug](.github/ISSUE_TEMPLATE/bug_report.md)
- 💡 [Request a Feature](.github/ISSUE_TEMPLATE/feature_request.md)

## Acknowledgments

Built with:
- [Groq](https://groq.com/) - Fast LLM inference
- [OpenAI](https://openai.com/) - GPT models
- [Temporal.io](https://temporal.io/) - Workflow orchestration
- [TypeScript](https://www.typescriptlang.org/) - Type safety
