# Temporal.io Setup Guide

This guide will help you set up and use Temporal.io in the PR Risk Scoring Tool.

## Overview

Temporal.io is a workflow orchestration platform that provides:
- **Reliability**: Automatic retries and failure recovery
- **Scalability**: Handle high volumes of risk analysis requests
- **Observability**: Track workflow execution in Temporal UI
- **Durability**: Workflows persist even if workers restart

## Prerequisites

- Docker and Docker Compose (for local Temporal server)
- Node.js 18+ and npm
- Git repository (for analyzing diffs)

## Quick Start

### 1. Start Temporal Server

Start the Temporal server using Docker Compose:

```bash
npm run temporal:start
```

This will start:
- Temporal server on `localhost:7233` (gRPC)
- Temporal UI on `http://localhost:8081` (changed from 8080 to avoid conflicts)
- PostgreSQL database for Temporal state

### 2. Start the Worker

In a separate terminal, start the Temporal worker:

```bash
npm run temporal:worker
```

The worker will:
- Connect to the Temporal server
- Listen for workflow tasks on the `pr-risk-analysis` task queue
- Execute activities (git diff extraction and risk analysis)

### 3. Start a Workflow

Use the Temporal CLI to start a workflow:

```bash
# Using ts-node directly
ts-node src/temporal/cli.ts start --base main --head feature-branch --wait

# Or after building
node dist/temporal/cli.js start --base main --head feature-branch --wait
```

## Configuration

### Environment Variables

Create a `.env` file or set environment variables:

```bash
# Temporal Configuration
TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_NAMESPACE=default

# LLM Configuration (for risk analysis)
GROQ_API_KEY=your-groq-api-key
# OR
OPENAI_API_KEY=your-openai-api-key
```

### Task Queue

By default, workflows use the `pr-risk-analysis` task queue. You can customize this:

```bash
ts-node src/temporal/cli.ts start --task-queue my-queue --base main --head feature-branch
```

## Usage Examples

### Analyze Diff Between Branches

```bash
ts-node src/temporal/cli.ts start \
  --base main \
  --head feature-branch \
  --title "Add new feature" \
  --description "Implements user authentication" \
  --wait
```

### Analyze Uncommitted Changes

```bash
ts-node src/temporal/cli.ts start \
  --uncommitted \
  --title "WIP: Fix bug" \
  --wait
```

### Analyze Diff from File

```bash
ts-node src/temporal/cli.ts start \
  --file examples/sample-diff.txt \
  --wait
```

### Analyze Diff from Stdin

```bash
git diff | ts-node src/temporal/cli.ts start --stdin --wait
```

### Get Workflow Result Later

If you don't use `--wait`, you can get the result later:

```bash
# Start workflow (returns workflow ID)
ts-node src/temporal/cli.ts start --base main --head feature-branch

# Get result using workflow ID
ts-node src/temporal/cli.ts result <workflow-id>
```

### Cancel a Running Workflow

```bash
ts-node src/temporal/cli.ts cancel <workflow-id>
```

## Architecture

### Components

1. **Workflows** (`src/temporal/workflows.ts`)
   - Orchestrate the risk analysis process
   - Define retry policies and timeouts
   - Handle workflow state

2. **Activities** (`src/temporal/activities.ts`)
   - Extract git diffs from various sources
   - Perform risk analysis using LLM
   - Execute actual work (can fail and retry)

3. **Worker** (`src/temporal/worker.ts`)
   - Runs workflows and activities
   - Connects to Temporal server
   - Processes tasks from task queues

4. **Client** (`src/temporal/client.ts`)
   - Starts workflows
   - Queries workflow state
   - Cancels workflows

### Workflow Flow

```
Client → Start Workflow → Temporal Server → Worker
                                          ↓
                                    Extract Git Diff (Activity)
                                          ↓
                                    Analyze Risk (Activity)
                                          ↓
                                    Return Result
```

## Monitoring

### Temporal UI

Access the Temporal UI at `http://localhost:8081` to:
- View running workflows
- See workflow history
- Monitor activity execution
- Debug failed workflows

### Logs

View Temporal server logs:

```bash
npm run temporal:logs
```

## Production Deployment

### Build for Production

```bash
npm run build
```

### Run Worker in Production

```bash
NODE_ENV=production node dist/temporal/worker.js
```

### Connect to Production Temporal Server

Set environment variables:

```bash
TEMPORAL_ADDRESS=your-temporal-server:7233
TEMPORAL_NAMESPACE=production
```

## Troubleshooting

### Worker Can't Connect

- Ensure Temporal server is running: `docker-compose ps`
- Check `TEMPORAL_ADDRESS` environment variable
- Verify network connectivity

### Workflow Fails

- Check Temporal UI for error details
- Verify LLM API keys are set
- Check git repository access
- Review activity logs

### Activities Timeout

- Increase timeout in workflow configuration
- Check network connectivity
- Verify LLM API is accessible

## Advanced Configuration

### Custom Retry Policies

Edit `src/temporal/workflows.ts` to customize retry behavior:

```typescript
const activities = proxyActivities<RiskAnalysisActivities>({
  startToCloseTimeout: '10 minutes', // Increase timeout
  retry: {
    initialInterval: '2s',
    backoffCoefficient: 2,
    maximumInterval: '200s',
    maximumAttempts: 5, // More retries
  },
});
```

### Multiple Workers

Run multiple workers for scalability:

```bash
# Terminal 1
npm run temporal:worker

# Terminal 2
TASK_QUEUE=pr-risk-analysis npm run temporal:worker
```

### Custom Task Queues

Use different task queues for different environments:

```bash
# Development
ts-node src/temporal/cli.ts start --task-queue dev --base main --head feature

# Production
ts-node src/temporal/cli.ts start --task-queue prod --base main --head feature
```

## Next Steps

- Integrate with CI/CD pipelines
- Set up monitoring and alerting
- Configure workflow versioning
- Add more complex workflows (e.g., parallel analysis, notifications)

## Resources

- [Temporal Documentation](https://docs.temporal.io/)
- [Temporal TypeScript SDK](https://docs.temporal.io/dev-guide/typescript)
- [Temporal UI Guide](https://docs.temporal.io/ui)
