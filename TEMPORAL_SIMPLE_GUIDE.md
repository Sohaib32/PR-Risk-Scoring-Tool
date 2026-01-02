# Temporal.io - Simple Guide for Beginners

## What is Temporal? (In Plain English)

Think of Temporal as a **smart task manager** for your code. Instead of running code directly, you tell Temporal "do this task" and it:
- ✅ **Remembers** what needs to be done (even if your computer crashes)
- ✅ **Retries** automatically if something fails
- ✅ **Tracks** everything so you can see what happened
- ✅ **Scales** - can handle many tasks at once

## Real-World Analogy

Imagine you're ordering food delivery:
- **Without Temporal**: You call the restaurant, wait on the phone, hope they remember your order, and if something goes wrong, you start over.
- **With Temporal**: You place an order through an app. The app remembers your order, tracks it, automatically retries if the restaurant is busy, and you can check the status anytime.

## Why Use Temporal for PR Risk Analysis?

Your PR risk analysis tool does two main things:
1. **Extract git diff** (get the code changes)
2. **Analyze risk** (use AI to assess the risk)

**Without Temporal:**
- If the AI API is slow or fails, you lose everything
- You have to manually retry
- No way to see what's happening
- Can't handle many PRs at once

**With Temporal:**
- If something fails, it automatically retries
- You can see the progress in a web UI
- Can analyze many PRs simultaneously
- Everything is logged and trackable

## The 4 Main Parts of Temporal

### 1. **Workflow** = The Recipe
A workflow is like a recipe that says "do step 1, then step 2, then step 3". It's the **plan** of what needs to happen.

**Example:** "First get the git diff, then analyze it for risk"

### 2. **Activity** = The Actual Work
An activity is the **actual code** that does the work. It's like the cooking step in a recipe.

**Example:** The code that calls the AI API to analyze risk

### 3. **Worker** = The Chef
A worker is a program that **runs** the workflows and activities. It's always running, waiting for tasks.

**Example:** A background service that processes PR analysis requests

### 4. **Client** = The Order Taker
A client is what **starts** a workflow. It's like placing an order.

**Example:** Your CLI command that says "analyze this PR"

## Visual Flow

```
You (Client)
  ↓ "Analyze this PR"
Temporal Server
  ↓ "Here's a task"
Worker
  ↓ Runs Workflow
  ↓ Step 1: Extract Git Diff (Activity)
  ↓ Step 2: Analyze Risk (Activity)
  ↓ Done!
Result back to you
```

## Simple Example

Let's say you want to analyze a PR:

### Without Temporal (Old Way):
```bash
# Run directly - if it fails, you lose everything
ts-node src/cli.ts --base main --head feature-branch
```

### With Temporal (New Way):
```bash
# 1. Start Temporal server (one time)
npm run temporal:start

# 2. Start worker (keeps running)
npm run temporal:worker

# 3. In another terminal, start a workflow
ts-node src/temporal/cli.ts start --base main --head feature-branch --wait
```

The workflow will:
- ✅ Run automatically
- ✅ Retry if it fails
- ✅ Show progress
- ✅ Give you the result

## When to Use Temporal vs Direct Execution

### Use Temporal When:
- ✅ You want automatic retries
- ✅ You're processing many PRs
- ✅ You want to track/monitor progress
- ✅ You need reliability (production use)
- ✅ You want to queue tasks

### Use Direct Execution (Old Way) When:
- ✅ Quick one-off analysis
- ✅ Testing/debugging
- ✅ Simple scripts
- ✅ You don't need retries or monitoring

## Step-by-Step: Your First Temporal Workflow

### Step 1: Start Temporal Server
```bash
npm run temporal:start
```
This starts the "task manager" that coordinates everything.

**What it does:** Starts Docker containers with Temporal server and database.

### Step 2: Start a Worker
```bash
npm run temporal:worker
```
This starts a "chef" that will do the actual work.

**What it does:** Connects to Temporal and waits for tasks. Keep this running!

### Step 3: Start a Workflow
In a **new terminal** (keep the worker running):
```bash
ts-node src/temporal/cli.ts start --base main --head feature-branch --wait
```

**What it does:**
1. Sends a request to Temporal: "Analyze this PR"
2. Temporal gives it to the worker
3. Worker runs the workflow (extract diff → analyze risk)
4. You get the result

### Step 4: View in UI (Optional)
Open http://localhost:8081 in your browser to see:
- All workflows that ran
- Their status (running, completed, failed)
- Detailed logs
- Retry history

> **📖 Want to know what you can do in the UI?** See [TEMPORAL_UI_GUIDE.md](TEMPORAL_UI_GUIDE.md) for a complete guide!

## Common Commands

### Start Everything
```bash
# Terminal 1: Start server
npm run temporal:start

# Terminal 2: Start worker
npm run temporal:worker

# Terminal 3: Run workflows
ts-node src/temporal/cli.ts start --base main --head feature-branch --wait
```

### Check Status
```bash
# See what's running
docker-compose ps

# View logs
docker-compose logs -f temporal
```

### Stop Everything
```bash
npm run temporal:stop
```

## Understanding the Code Structure

```
src/temporal/
├── workflows.ts    ← The "recipe" (what to do)
├── activities.ts   ← The "cooking" (actual work)
├── worker.ts       ← The "chef" (runs everything)
└── client.ts       ← The "order taker" (starts workflows)
```

### workflows.ts
Defines the **steps**:
```typescript
1. Extract git diff
2. Analyze risk
3. Return result
```

### activities.ts
Does the **actual work**:
```typescript
- extractGitDiff() → Gets the code changes
- analyzeRisk() → Calls AI to analyze
```

### worker.ts
The **background service** that runs workflows

### client.ts
The **way to start** workflows from your code

## Troubleshooting

### "Connection refused"
- Make sure Temporal server is running: `docker-compose ps`
- Wait a few seconds after starting (it needs time to initialize)

### "Worker failed"
- Check that Temporal server is running
- Check your `.env` file has `GROQ_API_KEY` or `OPENAI_API_KEY`

### "Workflow not found"
- Make sure the worker is running
- Check the task queue name matches

## Key Concepts Summary

| Concept | What It Is | Real Example |
|---------|-----------|--------------|
| **Workflow** | The plan/steps | "Get diff, then analyze" |
| **Activity** | The actual work | "Call AI API" |
| **Worker** | Runs the work | Background service |
| **Client** | Starts workflows | Your CLI command |
| **Task Queue** | Where tasks wait | Like a queue at a store |

## Next Steps

1. **Try it once:** Follow the step-by-step above
2. **Check the UI:** Open http://localhost:8081
3. **Run multiple workflows:** Start several analyses
4. **See retries:** Temporarily break something and watch it retry

## Still Confused?

Think of it this way:
- **Temporal = Uber for your code**
- You request a ride (start workflow)
- Uber coordinates (Temporal server)
- A driver picks it up (worker)
- You can track it (UI)
- If something goes wrong, Uber handles it (retries)

The main benefit: **Reliability and visibility**. Your code runs reliably, and you can see what's happening.
