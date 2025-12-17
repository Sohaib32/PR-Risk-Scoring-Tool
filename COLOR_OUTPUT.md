# Colorful Output Guide

The PR Risk Scoring Tool now supports beautiful, colorful output! 🎨

## Output Formats

### 1. Beautiful Format (Default) ✨

This is the default format - a beautifully formatted report with colors, icons, and clear sections:

```powershell
npx ts-node src/cli.ts --file examples/sample-diff.txt
# or
npx ts-node src/cli.ts --uncommitted
```

**Features:**
- 🎨 Color-coded risk levels (Green=Low, Yellow=Medium, Red=High)
- 📋 Clear sections with icons
- ⚠️ Visual indicators for missing tests
- 🎯 Easy-to-read format

### 2. Pretty JSON Format

Colored JSON output with syntax highlighting:

```powershell
npx ts-node src/cli.ts --file examples/sample-diff.txt --format pretty
```

**Features:**
- Color-coded JSON keys and values
- Risk levels and migration risks highlighted
- Boolean values color-coded

### 3. Raw JSON Format

Plain JSON output (for scripts/piping):

```powershell
npx ts-node src/cli.ts --file examples/sample-diff.txt --format json
```

**Use cases:**
- Piping to other tools
- Scripting/automation
- When you need raw JSON

## Examples

### Beautiful Output (Default)
```powershell
npx ts-node src/cli.ts --uncommitted
```

### Pretty JSON
```powershell
npx ts-node src/cli.ts --base main --head feature --format pretty
```

### Raw JSON (for scripts)
```powershell
npx ts-node src/cli.ts --file diff.txt --format json | jq .
```

## Color Scheme

- **Risk Levels:**
  - 🟢 LOW = Green
  - 🟡 MEDIUM = Yellow  
  - 🔴 HIGH = Red

- **Migration Risk:**
  - 🟢 NONE = Green
  - 🟡 LOW = Yellow
  - 🔴 HIGH = Red

- **Missing Tests:**
  - ✅ NO = Green
  - ⚠️ YES = Red

## PowerShell Color Support

If colors don't appear in PowerShell, you may need to enable ANSI color support:

```powershell
# Enable ANSI colors (PowerShell 7+)
$PSStyle.OutputRendering = 'Ansi'

# Or for older PowerShell versions, use Windows Terminal
```

The beautiful format works best and is recommended for human-readable output!

