# Quick Start - Fixed npm Usage

## The Issue

`npm start -- --uncommitted` doesn't work because npm intercepts `--` flags before they reach your script.

## ✅ Working Solutions

### Option 1: Use Specific npm Scripts (Easiest)

```powershell
# Build first
npm run build

# Then use convenient scripts
npm run analyze:uncommitted
```

### Option 2: Use Wrapper Script Directly (Recommended)

```powershell
# Build first
npm run build

# Then use the wrapper
node scripts/run.js --uncommitted
node scripts/run.js --file examples/sample-diff.txt
node scripts/run.js --base main --head feature-branch
```

### Option 3: Use Development Mode

```powershell
# No build needed
npx ts-node src/cli.ts --uncommitted
npx ts-node src/cli.ts --file examples/sample-diff.txt
npx ts-node src/cli.ts --base main --head feature-branch
```

## Why npm start doesn't work

npm has a known issue where it parses `--` flags as npm configuration options before passing them to your script. This is an npm limitation, not a bug in your code.

## Quick Reference

| What you want | Use this |
|---------------|----------|
| `npm start -- --uncommitted` | ❌ Doesn't work |
| `npm run analyze:uncommitted` | ✅ Works! |
| `node scripts/run.js --uncommitted` | ✅ Works! |
| `npx ts-node src/cli.ts --uncommitted` | ✅ Works! |

## All Available Commands

```powershell
# Development (no build needed)
npx ts-node src/cli.ts --uncommitted
npx ts-node src/cli.ts --file examples/sample-diff.txt
npx ts-node src/cli.ts --base main --head feature-branch

# Production (after build)
npm run build
npm run analyze:uncommitted
node scripts/run.js --uncommitted
node scripts/run.js --file examples/sample-diff.txt
node scripts/run.js --base main --head feature-branch
```

## Summary

**For quick testing:** Use `npx ts-node src/cli.ts --uncommitted`

**For production:** Use `node scripts/run.js --uncommitted` or `npm run analyze:uncommitted`

Both work perfectly! 🎉

