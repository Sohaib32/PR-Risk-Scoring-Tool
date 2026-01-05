# Contributing to PR Risk Scoring Tool

Thank you for your interest in contributing to the PR Risk Scoring Tool! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

## Code of Conduct

Please be respectful and constructive in all interactions. We are committed to providing a welcoming and inclusive environment for all contributors.

## Getting Started

1. **Fork the repository** and clone it locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/PR-Risk-Scoring-Tool.git
   cd PR-Risk-Scoring-Tool
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env and add your API key
   ```

4. **Build the project**:
   ```bash
   npm run build
   ```

5. **Run tests**:
   ```bash
   npm test
   ```

## Development Workflow

1. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes** following our coding standards

3. **Test your changes**:
   ```bash
   npm run lint
   npm run build
   npm test
   ```

4. **Commit your changes** with clear, descriptive messages:
   ```bash
   git commit -m "feat: add new feature X"
   # or
   git commit -m "fix: resolve issue with Y"
   ```

   We follow [Conventional Commits](https://www.conventionalcommits.org/) format:
   - `feat:` - New features
   - `fix:` - Bug fixes
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring
   - `test:` - Adding or updating tests
   - `chore:` - Maintenance tasks

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** with a clear description of your changes

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode and follow the existing `tsconfig.json` settings
- Use meaningful variable and function names
- Add type annotations where TypeScript can't infer types

### Code Style

- Run `npm run lint` before committing
- Follow the existing ESLint configuration
- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Maximum line length: 120 characters

### Documentation

- Add JSDoc comments for all public functions and classes
- Include examples in JSDoc where appropriate
- Update README.md if adding new features
- Keep comments up-to-date with code changes

### Error Handling

- Always handle errors appropriately
- Provide meaningful error messages
- Use custom error types when appropriate
- Log errors with appropriate context

### Security

- Never commit API keys or sensitive data
- Validate all user inputs
- Follow security best practices
- Use type-safe operations

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (if available)
npm test -- --watch

# Run linter
npm run lint
```

### Writing Tests

- Write tests for all new features
- Maintain or improve code coverage
- Use descriptive test names
- Test edge cases and error conditions
- Place tests in the `tests/` directory

Example test structure:
```javascript
const test = require('node:test');
const assert = require('node:assert/strict');

test('feature X should do Y', () => {
  // Arrange
  const input = 'test';
  
  // Act
  const result = featureX(input);
  
  // Assert
  assert.equal(result, 'expected');
});
```

## Submitting Changes

### Before Submitting

- [ ] Code follows the project's style guidelines
- [ ] All tests pass locally
- [ ] Added tests for new functionality
- [ ] Updated documentation as needed
- [ ] No new lint warnings
- [ ] Commits follow Conventional Commits format
- [ ] Branch is up-to-date with main

### Pull Request Process

1. **Fill out the PR template** completely
2. **Link related issues** using "Fixes #issue-number"
3. **Describe your changes** in detail
4. **Include screenshots** for UI changes
5. **Request review** from maintainers
6. **Address review feedback** promptly
7. **Keep PR focused** - one feature/fix per PR

### PR Review Criteria

Your PR will be reviewed for:
- Code quality and style
- Test coverage
- Documentation completeness
- Security implications
- Performance impact
- Breaking changes
- Backward compatibility

## Reporting Bugs

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md) and include:

- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node.js version, etc.)
- Error messages and logs
- Screenshots if applicable

## Requesting Features

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md) and include:

- Clear description of the feature
- Problem it solves
- Proposed solution
- Use cases
- Alternatives considered

## Development Tips

### Local Testing

Test your changes locally before submitting:

```bash
# Test with uncommitted changes
npx ts-node src/cli.ts --uncommitted

# Test with sample diff
npx ts-node src/cli.ts --file examples/sample-diff.txt

# Test Temporal workflows
npm run temporal:start
npm run temporal:worker
npx ts-node src/temporal/cli.ts start --uncommitted --wait
```

### Debugging

- Set `NODE_ENV=development` for more detailed error messages
- Use `LOG_LEVEL=debug` for verbose logging
- Add breakpoints in VS Code for debugging TypeScript

### IDE Setup

We recommend using VS Code with these extensions:
- ESLint
- TypeScript and JavaScript Language Features
- Prettier (optional)

## Questions?

If you have questions about contributing:
- Open an issue with the "question" label
- Check existing issues and discussions
- Review the README.md and documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to PR Risk Scoring Tool! 🎉
