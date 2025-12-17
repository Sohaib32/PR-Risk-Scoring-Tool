# How to Run the PR Risk Scoring Tool

## ⚠️ Important: npm argument passing issue

Due to npm's argument parsing, use one of these methods:

## Method 1: Direct Execution (Recommended for Development)

Use `npx ts-node` directly instead of `npm run dev`:

```powershell
# Test with sample file
npx ts-node src/cli.ts --file examples/sample-diff.txt

# Test uncommitted changes
npx ts-node src/cli.ts --uncommitted

# Test between branches
npx ts-node src/cli.ts --base main --head feature-branch

# Test with PR context
npx ts-node src/cli.ts --file examples/sample-diff.txt --title "My PR" --description "Description"
```

## Method 2: Use npm Scripts (Recommended for Production)

After building, use the convenient npm scripts:

```powershell
# Build once
npm run build

# Use specific scripts (these work!)
npm run analyze:uncommitted
node scripts/run.js --file examples/sample-diff.txt
node scripts/run.js --base main --head feature-branch
```

**Note:** `npm start -- --uncommitted` doesn't work because npm intercepts `--` flags. Use `node scripts/run.js` directly or the specific npm scripts instead.

## Method 3: Use PowerShell Script

I've created a helper script. You can also create a simple PowerShell function:

```powershell
# Add to your PowerShell profile or run directly
function pr-analyze {
    npx ts-node src/cli.ts $args
}

# Then use it like:
pr-analyze --file examples/sample-diff.txt
pr-analyze --uncommitted
pr-analyze --base main --head feature-branch
```

## Quick Reference

| Command | Usage |
|---------|-------|
| `npx ts-node src/cli.ts --file <path>` | Analyze diff from file |
| `npx ts-node src/cli.ts --uncommitted` | Analyze uncommitted changes |
| `npx ts-node src/cli.ts --base <base> --head <head>` | Analyze between branches |
| `git diff \| npx ts-node src/cli.ts --stdin` | Analyze from stdin |
| `npx ts-node src/cli.ts --help` | Show help |

## Why npm run dev doesn't work?

npm intercepts `--` flags and tries to parse them as npm configuration options. This is a known npm behavior. Using `npx ts-node` directly bypasses this issue.

