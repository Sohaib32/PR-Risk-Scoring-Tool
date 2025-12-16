# Examples

This directory contains example diffs and their expected risk assessments.

## Running the Examples

### Using the sample diff file:

```bash
npm run dev -- --file examples/sample-diff.txt
```

### Expected Output

The tool should produce output similar to `expected-output.json`, which demonstrates:
- Risk level assessment (MEDIUM for payment-related changes)
- Specific risk factors identified
- Areas for reviewers to focus on
- Detection of missing test coverage
- Migration risk assessment

## Creating Your Own Examples

1. Generate a diff file:
   ```bash
   git diff main..your-branch > my-diff.txt
   ```

2. Analyze it:
   ```bash
   npm run dev -- --file my-diff.txt
   ```

3. Review the output and use it to guide your code review process.
