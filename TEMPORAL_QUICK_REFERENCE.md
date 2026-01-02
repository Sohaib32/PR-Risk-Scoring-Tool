# Temporal Quick Reference Card

## 🚀 Quick Start (3 Steps)

```bash
# 1. Start server (one terminal)
npm run temporal:start

# 2. Start worker (another terminal - keep running!)
npm run temporal:worker

# 3. Run workflow (third terminal)
ts-node src/temporal/cli.ts start --base main --head feature-branch --wait
```

## 📋 Common Commands

### Start/Stop
```bash
npm run temporal:start    # Start Temporal server
npm run temporal:stop     # Stop Temporal server
npm run temporal:worker   # Start worker
npm run temporal:logs     # View logs
```

### Run Workflows
```bash
# Analyze between branches
ts-node src/temporal/cli.ts start --base main --head feature-branch --wait

# Analyze uncommitted changes
ts-node src/temporal/cli.ts start --uncommitted --wait

# Analyze from file
ts-node src/temporal/cli.ts start --file diff.txt --wait

# Get result later (without --wait)
ts-node src/temporal/cli.ts result <workflow-id>

# Cancel a workflow
ts-node src/temporal/cli.ts cancel <workflow-id>
```

## 🔍 Check Status

```bash
# Check containers
docker-compose ps

# Check if port is open
Test-NetConnection -ComputerName localhost -Port 7233

# View UI
# Open http://localhost:8081 in browser
```

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Connection refused | Wait 10 seconds after starting, then retry |
| Worker can't connect | Check `docker-compose ps` - temporal should be "Up" |
| Port already in use | Stop other containers: `docker stop temporal-server` |
| Workflow not found | Make sure worker is running |

## 📚 Learn More

- **Beginner Guide:** [TEMPORAL_SIMPLE_GUIDE.md](TEMPORAL_SIMPLE_GUIDE.md)
- **Detailed Setup:** [TEMPORAL_SETUP.md](TEMPORAL_SETUP.md)

## 💡 Remember

- **Workflow** = The plan (what to do)
- **Activity** = The work (actual code)
- **Worker** = Runs the work (background service)
- **Client** = Starts workflows (your command)

## 🎯 When to Use

✅ **Use Temporal:**
- Production deployments
- Need automatic retries
- Want monitoring/visibility
- Processing many PRs

❌ **Skip Temporal:**
- Quick one-off analysis
- Testing/debugging
- Simple scripts
