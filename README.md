# PR-Risk-Scoring-Tool

An AI-powered tool that analyzes pull request diffs and produces risk assessments with actionable reviewer guidance.

## Features

- **LLM-Powered Analysis**: Uses Groq's Llama models to analyze code changes
- **Production Risk Assessment**: Evaluates critical paths, tests, migrations, and runtime impact
- **Structured JSON Output**: Returns consistent, machine-readable risk assessments
- **Multiple Input Methods**: Supports git branches, files, stdin, or uncommitted changes
- **Actionable Insights**: Provides specific risk factors and reviewer focus areas

## Installation

```bash
npm install
npm run build
```

## Usage

### Prerequisites

Set your Groq API key:
```bash
export GROQ_API_KEY='your-api-key-here'
```

Alternatively, you can use `OPENAI_API_KEY` (for backward compatibility):
```bash
export OPENAI_API_KEY='your-api-key-here'
```

### CLI Usage

**Analyze diff between branches:**
```bash
npm run dev -- --base main --head feature-branch
```

**Analyze diff from file:**
```bash
npm run dev -- --file diff.txt
```

**Analyze diff from stdin:**
```bash
git diff main..feature | npm run dev -- --stdin
```

**Analyze uncommitted changes:**
```bash
npm run dev -- --uncommitted
```

**With PR context:**
```bash
npm run dev -- --base main --head feature --title "Add payment feature" --description "Implements Stripe integration"
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
const assessment = await analyzer.analyzeDiff({ diff });

console.log(assessment);
```

## Output Format

The tool returns a JSON object with the following structure:

```json
{
  "risk_level": "LOW|MEDIUM|HIGH",
  "risk_summary": "Concise summary of the changes and their risk",
  "risk_factors": [
    "Specific risk factor 1",
    "Specific risk factor 2"
  ],
  "reviewer_focus_areas": [
    "Area reviewers should focus on 1",
    "Area reviewers should focus on 2"
  ],
  "missing_tests": true,
  "migration_risk": "NONE|LOW|HIGH"
}
```

### Field Descriptions

- **risk_level**: Overall risk assessment (LOW, MEDIUM, or HIGH)
- **risk_summary**: Brief, actionable summary of changes and their impact
- **risk_factors**: Specific risks identified in the code changes
- **reviewer_focus_areas**: Key areas where reviewers should focus attention
- **missing_tests**: Whether code changes lack corresponding test updates
- **migration_risk**: Risk level for data/schema migrations (NONE, LOW, or HIGH)

## Examples

See the `examples/` directory for sample diffs and their risk assessments.

## Development

**Build:**
```bash
npm run build
```

**Run in development:**
```bash
npx ts-node src/cli.ts --uncommitted
npx ts-node src/cli.ts --file examples/sample-diff.txt
```

**Run after building:**
```bash
npm run build
npm run analyze:uncommitted
# or
node scripts/run.js --uncommitted
```

**Lint:**
```bash
npm run lint
```

## License

MIT
