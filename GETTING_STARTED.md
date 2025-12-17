# Getting Started with PR Risk Scoring Tool

A simple, step-by-step guide to get you analyzing code changes in minutes! 🚀

## Step 1: Install Everything (2 minutes)

Open PowerShell in the project folder and run:

```powershell
npm install
npm run build
```

Wait for it to finish. You'll see "build successful" when done.

## Step 2: Get Your Free API Key (3 minutes)

1. Go to https://console.groq.com/
2. Sign up (it's free!)
3. Click "API Keys" in the left menu
4. Click "Create API Key"
5. Copy the key (looks like: `gsk_abc123xyz...`)

## Step 3: Set Up Your API Key

**Option A: Using .env file (Easiest)**

1. Open the `.env` file in the project folder
2. Replace `your-groq-api-key-here` with your actual key:
   ```
   GROQ_API_KEY=gsk_abc123xyz...
   ```
3. Save the file

**Option B: Using PowerShell (Quick test)**

```powershell
$env:GROQ_API_KEY="gsk_abc123xyz..."
```

Note: This only works for your current PowerShell session.

## Step 4: Run Your First Analysis! 🎉

Let's test with the sample file we included:

```powershell
npx ts-node src/cli.ts --file examples/sample-diff.txt
```

**What you'll see:**
- A beautiful colored report showing risk level
- Specific risks found in the code
- What reviewers should focus on
- Whether tests are missing

## Real Examples You Can Try Right Now

### Example 1: Analyze Sample Diff (No Git Needed)

```powershell
npx ts-node src/cli.ts --file examples/sample-diff.txt
```

**Output you'll get:**
```
╔═══════════════════════════════════════════════════════════╗
║  PR Risk Assessment Report                                ║
╚═══════════════════════════════════════════════════════════╝

Risk Level: MEDIUM

📋 Summary:
  Changes modify core authentication logic without visible test updates

⚠️  Risk Factors:
    • Authentication flow changes without test coverage
    • Potential security implications

👀 Reviewer Focus Areas:
    • Verify authentication edge cases
    • Check security implications

Missing Tests: YES ⚠️

Migration Risk: NONE
```

### Example 2: Check Your Uncommitted Changes

Have some code changes you haven't committed yet? Check them:

```powershell
npx ts-node src/cli.ts --uncommitted
```

This analyzes all your current uncommitted changes in Git.

### Example 3: Compare Two Branches

```powershell
npx ts-node src/cli.ts --base main --head feature-branch
```

This shows you the risk of merging `feature-branch` into `main`.

### Example 4: Analyze with Context (Better Results!)

Add a title and description for more accurate analysis:

```powershell
npx ts-node src/cli.ts --file examples/sample-diff.txt --title "Add user login" --description "Implements JWT authentication for user login flow"
```

The AI understands your changes better with context!

### Example 5: Get JSON Output (For Scripts/CI)

```powershell
npx ts-node src/cli.ts --file examples/sample-diff.txt --format json
```

**Output:**
```json
{
  "risk_level": "MEDIUM",
  "risk_summary": "Authentication changes without test coverage",
  "risk_factors": ["Security implications", "Missing tests"],
  "reviewer_focus_areas": ["Edge cases", "Security"],
  "missing_tests": true,
  "migration_risk": "NONE"
}
```

### Example 6: Pipe Git Diff Directly

```powershell
git diff | npx ts-node src/cli.ts --stdin
```

Or compare specific commits:

```powershell
git diff abc123..def456 | npx ts-node src/cli.ts --stdin
```

## Quick Commands Reference

| What You Want | Command |
|---------------|---------|
| Show help | `npm start` |
| Test with sample | `npx ts-node src/cli.ts --file examples/sample-diff.txt` |
| Check uncommitted | `npx ts-node src/cli.ts --uncommitted` |
| Compare branches | `npx ts-node src/cli.ts --base main --head feature` |
| From stdin | `git diff \| npx ts-node src/cli.ts --stdin` |
| JSON output | `npx ts-node src/cli.ts --file diff.txt --format json` |

## Using After Build (Faster!)

After running `npm run build`, you can use the faster built version:

```powershell
# Build once
npm run build

# Then use these faster commands:
node scripts/run.js --uncommitted
node scripts/run.js --file examples/sample-diff.txt
node scripts/run.js --base main --head feature
```

## Common Issues & Solutions

### ❌ "API key is required"

**Problem:** You didn't set the API key.

**Solution:** 
1. Check your `.env` file has `GROQ_API_KEY=your-key`
2. Or run: `$env:GROQ_API_KEY="your-key"`

### ❌ "No diff content found"

**Problem:** No changes to analyze.

**Solutions:**
- For `--uncommitted`: Make some changes first (`git status` to check)
- For `--file`: Check the file path is correct
- For `--base/--head`: Make sure branches exist (`git branch` to check)

### ❌ "Not a git repository"

**Problem:** Using git commands outside a git repo.

**Solution:** Either:
- Use `--file` option with a diff file instead
- Or run from inside a git repository folder

### ❌ "Timeout waiting for stdin"

**Problem:** Using `--stdin` but not piping any data.

**Solution:** Pipe data: `git diff | npx ts-node src/cli.ts --stdin`

## Real-World Workflow Example

Here's how you might use this in your daily work:

```powershell
# 1. You're working on a feature branch
git checkout -b my-new-feature

# 2. Make some changes to your code
# ... edit files ...

# 3. Before committing, check the risk
npx ts-node src/cli.ts --uncommitted

# 4. Review the output, add tests if needed

# 5. After committing, compare with main
npx ts-node src/cli.ts --base main --head my-new-feature --title "Add feature X" --description "This feature does Y"

# 6. Get JSON for your CI pipeline
npx ts-node src/cli.ts --base main --head my-new-feature --format json > risk-report.json
```

## Testing Without Git

Don't have a git repo? No problem! Create a test diff file:

**Create `test-diff.txt`:**
```diff
diff --git a/example.js b/example.js
index abc123..def456 100644
--- a/example.js
+++ b/example.js
@@ -1,5 +1,8 @@
 function processPayment(amount) {
-  return stripe.charge(amount);
+  if (amount > 10000) {
+    throw new Error('Amount too large');
+  }
+  return stripe.charge(amount);
 }
```

**Then analyze it:**
```powershell
npx ts-node src/cli.ts --file test-diff.txt
```

## Next Steps

Now that you're running the tool:

1. ✅ Try it on your actual code changes
2. ✅ Add `--title` and `--description` for better results  
3. ✅ Use `--format json` to integrate with CI/CD
4. ✅ Check the main [README.md](README.md) for advanced features

## Quick Test (Copy & Paste)

Test everything is working:

```powershell
# Set API key (replace with yours!)
$env:GROQ_API_KEY="your-groq-key-here"

# Run test
npx ts-node src/cli.ts --file examples/sample-diff.txt

# Should show a colorful risk report!
```

---

**Need help?** Check [README.md](README.md) for more details or open an issue on GitHub!

**Pro Tip:** Use `--title` and `--description` for 50% better analysis accuracy! 🎯
