# Usage and Testing Guide

## Prerequisites

1. **Get a Groq API Key**
   - Sign up at https://console.groq.com/
   - Create an API key
   - Copy the key for use below

2. **Set up Environment Variable**

   **Option 1: Using .env file (Recommended)**
   ```bash
   # Create a .env file in the project root
   echo "GROQ_API_KEY=your-api-key-here" > .env
   ```

   **Option 2: Using PowerShell (Windows)**
   ```powershell
   $env:GROQ_API_KEY="your-api-key-here"
   ```

   **Option 3: Using Command Prompt (Windows)**
   ```cmd
   set GROQ_API_KEY=your-api-key-here
   ```

   **Option 4: Using Bash (Linux/Mac)**
   ```bash
   export GROQ_API_KEY='your-api-key-here'
   ```

## Building the Project

First, make sure the project is built:

```bash
npm install
npm run build
```

## Testing Methods

### Method 1: Test with Sample Diff File

The easiest way to test is using the provided sample diff:

```bash
# Using npx ts-node (development mode - recommended)
npx ts-node src/cli.ts --file examples/sample-diff.txt

# Or using the built version
npm run build
npm start -- --file examples/sample-diff.txt
```

### Method 2: Test with Git Diff (Uncommitted Changes)

If you have uncommitted changes in your git repository:

```bash
npx ts-node src/cli.ts --uncommitted
```

### Method 3: Test with Git Branches

Compare two branches or commits:

```bash
npx ts-node src/cli.ts --base main --head feature-branch
```

### Method 4: Test with Stdin (Pipe)

Pipe a git diff directly:

```bash
git diff main..feature-branch | npx ts-node src/cli.ts --stdin
```

### Method 5: Test with PR Context

Add PR title and description for better context:

```bash
npx ts-node src/cli.ts --file examples/sample-diff.txt --title "Add payment retry logic" --description "Implements retry mechanism for failed payments"
```

## Expected Output

The tool returns a JSON object with risk assessment:

```json
{
  "risk_level": "MEDIUM",
  "risk_summary": "Adds retry logic to payment processing which could mask underlying issues",
  "risk_factors": [
    "Retry logic may hide network or API issues",
    "No logging of retry attempts for debugging"
  ],
  "reviewer_focus_areas": [
    "Verify retry delay logic is appropriate",
    "Check error handling for edge cases"
  ],
  "missing_tests": true,
  "migration_risk": "NONE"
}
```

## Quick Test Script

Run this to quickly test the tool:

```bash
# Test with sample file
npx ts-node src/cli.ts --file examples/sample-diff.txt
```

## Troubleshooting

### Error: "API key is required"
- Make sure you've set `GROQ_API_KEY` or `OPENAI_API_KEY` environment variable
- Check that your `.env` file is in the project root (if using dotenv)

### Error: "No diff content found"
- Verify the file path is correct
- Check that the file contains valid diff content
- For git operations, ensure you're in a git repository

### Error: "Diff is too large"
- The tool limits diffs to 100KB
- Consider analyzing smaller chunks or specific files

### Error: "Not a git repository"
- Make sure you're running git commands from within a git repository
- Initialize git if needed: `git init`

## Advanced Usage

### Using as a Global Command

After building, you can install globally:

```bash
npm link
pr-risk-analyzer --file examples/sample-diff.txt
```

### Programmatic Usage

```typescript
import { RiskAnalyzer, GitDiffExtractor } from './src';

const analyzer = new RiskAnalyzer(process.env.GROQ_API_KEY);
const extractor = new GitDiffExtractor();

const diff = await extractor.getDiff('main', 'feature-branch');
const assessment = await analyzer.analyzeDiff({ 
  diff,
  prTitle: "My PR Title",
  prDescription: "My PR Description"
});

console.log(assessment);
```

