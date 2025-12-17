# Quick Test Guide

## Step-by-Step Testing

### Step 1: Get Your API Key
1. Go to https://console.groq.com/
2. Sign up or log in
3. Create an API key
4. Copy the key

### Step 2: Set Up API Key

**Windows PowerShell:**
```powershell
$env:GROQ_API_KEY="your-api-key-here"
```

**Or create a .env file:**
```bash
echo "GROQ_API_KEY=your-api-key-here" > .env
```

### Step 3: Build the Project
```bash
npm install
npm run build
```

### Step 4: Run Quick Test

**Option A: Use the test script (Windows)**
```powershell
.\test-example.ps1
```

**Option B: Use the test script (Linux/Mac)**
```bash
chmod +x test-example.sh
./test-example.sh
```

**Option C: Manual test**
```bash
npx ts-node src/cli.ts --file examples/sample-diff.txt
```

### Step 5: Check the Output

You should see JSON output like:
```json
{
  "risk_level": "MEDIUM",
  "risk_summary": "...",
  "risk_factors": [...],
  "reviewer_focus_areas": [...],
  "missing_tests": true,
  "migration_risk": "NONE"
}
```

## Testing with Your Own Code

### Test Uncommitted Changes
```bash
# Make some changes to your code, then:
npx ts-node src/cli.ts --uncommitted
```

### Test Between Branches
```bash
npx ts-node src/cli.ts --base main --head your-feature-branch
```

### Test with PR Context
```bash
npx ts-node src/cli.ts --file examples/sample-diff.txt --title "My PR Title" --description "My PR Description"
```

## Common Issues

**"API key is required"**
- Make sure you set `GROQ_API_KEY` environment variable
- Or create a `.env` file with `GROQ_API_KEY=your-key`

**"No diff content found"**
- Check that the file path is correct
- Verify the file contains valid diff content

**Build errors**
- Run `npm install` first
- Make sure TypeScript is installed: `npm install -g typescript` (optional)

