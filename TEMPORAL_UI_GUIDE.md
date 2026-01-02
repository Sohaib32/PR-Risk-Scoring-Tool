# Temporal UI Guide - What Can You Do?

## Accessing the UI

Once Temporal is running, open: **http://localhost:8081**

## What You'll See

The Temporal UI shows you **everything that's happening** with your workflows. Think of it like a dashboard for your code.

## Main Sections

### 1. **Workflows** (Most Important!)

This is where you see all your PR risk analyses.

**What you can see:**
- ✅ **All workflows** that have run
- ✅ **Status** of each workflow:
  - 🟢 **Running** - Currently being processed
  - ✅ **Completed** - Finished successfully
  - ❌ **Failed** - Something went wrong
  - ⏸️ **Paused** - Temporarily stopped
- ✅ **When** they started and finished
- ✅ **How long** they took

**What you can do:**
- Click on any workflow to see **detailed information**
- See the **input** (what you asked it to analyze)
- See the **output** (the risk assessment result)
- See **all the steps** it took
- See **retry attempts** if something failed
- **Cancel** a running workflow
- **Terminate** a stuck workflow

### 2. **Workflow Details Page**

When you click on a workflow, you see:

#### **Summary Tab**
- Workflow ID
- Status
- Start/End time
- Duration
- Input parameters (what branch, what file, etc.)
- Result (the risk assessment JSON)

#### **History Tab**
Shows every step that happened:
```
1. Workflow started
2. Activity: extractGitDiff (started)
3. Activity: extractGitDiff (completed)
4. Activity: analyzeRisk (started)
5. Activity: analyzeRisk (completed)
6. Workflow completed
```

If something failed, you'll see:
```
1. Workflow started
2. Activity: extractGitDiff (started)
3. Activity: extractGitDiff (failed) ← Error here!
4. Activity: extractGitDiff (retry attempt 1)
5. Activity: extractGitDiff (completed)
...
```

#### **Pending Activities Tab**
Shows activities that are currently running or waiting

#### **Stack Trace Tab**
If a workflow failed, shows the error details

### 3. **Search & Filter**

You can:
- **Search** for specific workflows by ID
- **Filter** by:
  - Status (Running, Completed, Failed)
  - Workflow type
  - Time range
  - Task queue

### 4. **Task Queues**

Shows which task queues are active and how many tasks are waiting/processing.

## Common Actions in the UI

### View a Workflow Result

1. Go to **Workflows** page
2. Find your workflow (search by ID or browse)
3. Click on it
4. Go to **Summary** tab
5. Scroll down to see the **Result** - this is your risk assessment!

### See What Went Wrong (If Failed)

1. Click on a failed workflow
2. Go to **History** tab
3. Look for red/failed items
4. Click on them to see error details
5. Check **Stack Trace** tab for technical details

### Cancel a Running Workflow

1. Find the running workflow
2. Click the **Cancel** button (or use the menu)
3. Confirm cancellation

### Retry a Failed Workflow

1. Click on the failed workflow
2. Click **Retry** or **Reset** button
3. It will start again from the beginning

## Real Example: Analyzing a PR

Let's say you run:
```bash
ts-node src/temporal/cli.ts start --base main --head feature-branch --wait
```

### In the UI, you'll see:

1. **A new workflow appears** in the list
   - Status: "Running"
   - Workflow ID: something like `pr-risk-analysis-1234567890`

2. **Click on it** to see details:
   - **Input**: `{ diffSource: { type: 'branches', base: 'main', head: 'feature-branch' } }`
   - **History** shows:
     ```
     ✓ Workflow started
     ✓ Activity: extractGitDiff started
     ✓ Activity: extractGitDiff completed (got the diff)
     ✓ Activity: analyzeRisk started
     ✓ Activity: analyzeRisk completed (got the assessment)
     ✓ Workflow completed
     ```

3. **Result** (in Summary tab):
   ```json
   {
     "assessment": {
       "risk_level": "MEDIUM",
       "risk_summary": "...",
       "risk_factors": [...],
       ...
     },
     "diff": "...",
     "timestamp": "2025-12-30T..."
   }
   ```

## What's Useful About the UI?

### 1. **Debugging**
If something fails, you can see exactly where and why:
- Which activity failed?
- What was the error?
- Did it retry?
- What was the input that caused the failure?

### 2. **Monitoring**
See what's happening right now:
- How many workflows are running?
- Are they stuck?
- How long are they taking?

### 3. **History**
Look back at past analyses:
- What did you analyze last week?
- What was the result?
- How long did it take?

### 4. **Performance**
See patterns:
- Are workflows getting slower?
- Which activities take the longest?
- Are there bottlenecks?

## Visual Guide

```
Temporal UI (http://localhost:8081)
│
├── Workflows (Main Page)
│   ├── List of all workflows
│   │   ├── pr-risk-analysis-1234 [✅ Completed]
│   │   ├── pr-risk-analysis-1235 [🟢 Running]
│   │   └── pr-risk-analysis-1236 [❌ Failed]
│   │
│   └── Click on one → Workflow Details
│       ├── Summary Tab
│       │   ├── Status, timing
│       │   ├── Input (what you asked)
│       │   └── Result (the assessment)
│       │
│       ├── History Tab
│       │   └── Step-by-step what happened
│       │
│       ├── Pending Activities
│       │   └── What's running now
│       │
│       └── Stack Trace (if failed)
│           └── Error details
│
├── Task Queues
│   └── Shows active queues
│
└── Search/Filter
    └── Find specific workflows
```

## Pro Tips

1. **Bookmark the UI** - http://localhost:8081
2. **Keep it open** while running workflows to see real-time updates
3. **Use search** - If you know the workflow ID, search for it
4. **Check History** - If something seems slow, check the history to see where it's stuck
5. **Filter by status** - Use filters to find all failed workflows

## When to Use the UI

✅ **Use it when:**
- A workflow is taking too long (check if it's stuck)
- Something failed (see why)
- You want to see past results
- You're debugging an issue
- You want to monitor what's happening

❌ **Don't need it when:**
- Everything is working fine
- You just want the result (use `--wait` flag)
- You're doing quick tests

## Quick Reference

| What You Want | Where to Look |
|---------------|---------------|
| See all workflows | Workflows page |
| See result | Workflow → Summary tab → Result |
| See what failed | Workflow → History tab → Failed step |
| See error details | Workflow → Stack Trace tab |
| Cancel workflow | Workflow → Cancel button |
| Find a workflow | Use search box |
| See what's running | Filter by "Running" status |

## Summary

The Temporal UI is like a **control panel** for your workflows. You can:
- 👀 **See** what's happening
- 🔍 **Debug** when things go wrong
- 📊 **Monitor** performance
- 📜 **Review** past analyses
- ⚙️ **Control** workflows (cancel, retry, etc.)

It's especially useful when something goes wrong or when you want to understand what's happening behind the scenes!
