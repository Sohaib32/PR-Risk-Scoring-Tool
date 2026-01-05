# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of PR Risk Scoring Tool seriously. If you discover a security vulnerability, please follow these steps:

### 1. **Do Not** Open a Public Issue

Please do not report security vulnerabilities through public GitHub issues, discussions, or pull requests.

### 2. Report Privately

Instead, please report security issues by:
- Opening a [private security advisory](https://github.com/Sohaib32/PR-Risk-Scoring-Tool/security/advisories/new)
- Or emailing the maintainers directly

### 3. Include Details

Please include as much information as possible:
- Type of vulnerability
- Full paths of affected source files
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability
- Possible fix (if you have suggestions)

### 4. Response Timeline

- We will acknowledge receipt of your vulnerability report within 48 hours
- We will provide a more detailed response within 5 business days
- We will work on a fix and coordinate disclosure with you
- We will publicly acknowledge your contribution (unless you prefer to remain anonymous)

## Security Best Practices for Users

When using PR Risk Scoring Tool:

### API Keys
- **Never** commit API keys to version control
- Use environment variables or `.env` files (ensure `.env` is in `.gitignore`)
- Rotate API keys regularly
- Use different keys for development and production

### Input Validation
- Be cautious when analyzing diffs from untrusted sources
- The tool validates file paths and git references, but always review inputs
- Limit file sizes when accepting user input

### Network Security
- Use secure connections (HTTPS) for API calls (default behavior)
- Consider using a firewall to restrict outbound API connections if needed
- Monitor API usage for unusual patterns

### Dependency Security
- Keep the tool and its dependencies up to date
- Run `npm audit` regularly to check for vulnerabilities
- Use Dependabot (enabled by default) for automatic security updates

### Production Use
- Run with least privilege (don't run as root)
- Use read-only access for git repositories when possible
- Consider rate limiting and timeouts for API calls
- Log security-relevant events

## Known Security Considerations

### 1. LLM API Keys
- API keys provide access to LLM services and may incur costs
- Keep keys secure and monitor usage
- Keys are never logged or exposed by this tool

### 2. Git Repository Access
- The tool reads from git repositories
- Ensure it only accesses repositories you control
- Review permissions when running in CI/CD environments

### 3. Large Diffs
- Very large diffs may consume significant memory
- The tool has built-in size limits (configurable)
- Consider splitting large diffs manually if needed

### 4. Third-Party Dependencies
- We regularly update dependencies for security patches
- Review the dependency tree with `npm audit`
- Report any dependency vulnerabilities you discover

## Security Features

This tool includes several security features:

- ✅ Input validation for file paths (prevents directory traversal)
- ✅ Input validation for git references (prevents injection)
- ✅ File size limits (prevents memory exhaustion)
- ✅ API key protection (never logged or exposed)
- ✅ Type-safe TypeScript throughout
- ✅ Automated security scanning (CodeQL)
- ✅ Dependency vulnerability monitoring (Dependabot)

## Disclosure Policy

- Security issues are fixed and released as soon as possible
- We follow coordinated disclosure practices
- Public disclosure happens after a fix is available
- We credit security researchers (unless they prefer anonymity)

## Contact

For security concerns, please use GitHub's security advisory feature or contact the maintainers directly.

Thank you for helping keep PR Risk Scoring Tool and its users safe!
