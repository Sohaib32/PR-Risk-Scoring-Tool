# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Dependabot configuration for automated dependency updates
- CodeQL security scanning workflow
- Comprehensive CONTRIBUTING.md guide
- PR template and issue templates (bug report, feature request)
- VS Code workspace settings and extension recommendations
- SECURITY.md with security policy and vulnerability reporting guidelines
- Comprehensive JSDoc comments throughout codebase
- Input validation for file paths (prevents directory traversal attacks)
- Input validation for git references (prevents injection attacks)
- File size checks in GitDiffExtractor (prevents memory exhaustion)
- Additional unit tests (schema, errors, config validation)

### Changed
- Enhanced CI workflow to use `npm ci` for faster, more reliable builds
- CI now runs tests and security audits
- CI includes dependency review for pull requests
- Improved error messages with more context
- Enhanced documentation with better examples
- Updated JSDoc comments for better IDE support

### Security
- Added input sanitization to prevent path traversal attacks
- Added validation for git branch/commit names to prevent injection
- Added file size limits (100MB max) to prevent memory issues
- Added CodeQL security scanning to catch vulnerabilities
- Added Dependabot to monitor dependency vulnerabilities

## [1.0.0] - Previous Release

### Added
- Initial release with core functionality
- LLM-powered risk analysis using Groq/OpenAI
- Automatic chunking for large diffs
- Temporal.io workflow integration
- Support for multiple input methods (file, stdin, git)
- Interactive UI mode
- Beautiful formatted output
- CI integration support
- Comprehensive documentation

[Unreleased]: https://github.com/Sohaib32/PR-Risk-Scoring-Tool/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Sohaib32/PR-Risk-Scoring-Tool/releases/tag/v1.0.0
