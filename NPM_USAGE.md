# Using npm Commands

## The Problem

npm intercepts `--` flags and tries to parse them as npm configuration options. This is why `npm start -- --uncommitted` doesn't work.

## Solutions

### Solution 1: Use Direct Node Command (Recommended)

Instead of `npm start`, use the wrapper script directly:

```powershell
# This works perfectly!
node scripts/run.js --uncommitted
node scripts/run.js --file examples/sample-diff.txt
node scripts/run.js --base main --head feature-branch
```

### Solution 2: Use Specific npm Scripts

I've added convenient npm scripts for common use cases:

```powershell
# Analyze uncommitted changes
npm run analyze:uncommitted

# Analyze a file (you'll need to add the file path)
npm run analyze:file examples/sample-diff.txt
```

### Solution 3: Use npx with Built Version

After building, you can use:

```powershell
npm run build
npx node dist/cli.js --uncommitted
```

### Solution 4: Use Development Mode

For development, use:

```powershell
npm run dev --uncommitted
# or
npx ts-node src/cli.ts --uncommitted
```

## Why npm start doesn't work

When you run `npm start -- --uncommitted`, npm sees:
1. `npm start` - runs the start script
2. `--` - should pass remaining args to script
3. `--uncommitted` - npm tries to parse this as an npm config option

npm intercepts `--uncommitted` before it reaches your script, causing the error.

## Recommended Workflow

**For Production/Testing:**
```powershell
npm run build
node scripts/run.js --uncommitted
```

**For Development:**
```powershell
npx ts-node src/cli.ts --uncommitted
```

## Quick Reference

| Command | Works? | Notes |
|---------|--------|-------|
| `npm start -- --uncommitted` | ❌ | npm intercepts flags |
| `node scripts/run.js --uncommitted` | ✅ | Recommended |
| `npm run dev --uncommitted` | ❌ | Same npm issue |
| `npx ts-node src/cli.ts --uncommitted` | ✅ | Development mode |
| `npm run analyze:uncommitted` | ✅ | Convenient shortcut |

