/**
 * Git diff extraction utilities
 * Provides methods to extract git diffs from various sources
 */

import { simpleGit, SimpleGit } from 'simple-git';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Maximum allowed diff size in bytes to prevent memory issues
 */
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

/**
 * Utility class for extracting git diffs from various sources
 */
export class GitDiffExtractor {
  private git: SimpleGit;

  /**
   * Creates a new GitDiffExtractor instance
   * @param repoPath - Path to the git repository (defaults to current working directory)
   * @throws {Error} If the provided path is invalid
   */
  constructor(repoPath: string = process.cwd()) {
    if (!repoPath || typeof repoPath !== 'string') {
      throw new Error('Repository path must be a valid string');
    }
    this.git = simpleGit(repoPath);
  }

  /**
   * Get diff between two branches or commits
   * @param base - Base branch or commit
   * @param head - Head branch or commit
   * @returns The git diff string
   * @throws {Error} If git operation fails or parameters are invalid
   * @example
   * ```typescript
   * const extractor = new GitDiffExtractor();
   * const diff = await extractor.getDiff('main', 'feature-branch');
   * ```
   */
  async getDiff(base: string, head: string): Promise<string> {
    if (!base || !head) {
      throw new Error('Both base and head must be provided');
    }

    // Validate input to prevent injection attacks
    // Git references can contain: alphanumeric, dots, dashes, underscores, slashes, colons, tildes, carets, at symbols
    // Place hyphen at the end to avoid creating unintended character ranges
    if (!/^[a-zA-Z0-9._/:~^@-]+$/.test(base) || !/^[a-zA-Z0-9._/:~^@-]+$/.test(head)) {
      throw new Error(
        'Invalid branch or commit name. Only alphanumeric characters and common git reference characters are allowed.'
      );
    }

    try {
      const diff = await this.git.diff([base, head]);
      if (!diff || diff.trim().length === 0) {
        throw new Error(`No differences found between ${base} and ${head}`);
      }
      return diff;
    } catch (error) {
      if (error instanceof Error) {
        // Provide more helpful error messages
        if (error.message.includes('not a git repository')) {
          throw new Error('Not a git repository. Please run this command from a git repository.');
        }
        if (error.message.includes('unknown revision')) {
          throw new Error(`Invalid branch or commit: ${error.message}`);
        }
        throw new Error(`Failed to get git diff: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get diff for uncommitted changes
   * @returns The git diff string for uncommitted changes
   * @throws {Error} If git operation fails or no uncommitted changes exist
   * @example
   * ```typescript
   * const extractor = new GitDiffExtractor();
   * const diff = await extractor.getUncommittedDiff();
   * ```
   */
  async getUncommittedDiff(): Promise<string> {
    try {
      const diff = await this.git.diff();
      if (!diff || diff.trim().length === 0) {
        throw new Error('No uncommitted changes found');
      }
      return diff;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not a git repository')) {
          throw new Error('Not a git repository. Please run this command from a git repository.');
        }
        throw new Error(`Failed to get uncommitted diff: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get diff from a file
   * @param filePath - Path to the diff file
   * @returns The file contents as a string
   * @throws {Error} If file cannot be read or exceeds size limit
   * @example
   * ```typescript
   * const diff = GitDiffExtractor.readDiffFromFile('./my-diff.txt');
   * ```
   */
  static readDiffFromFile(filePath: string): string {
    if (!filePath) {
      throw new Error('File path is required');
    }

    // Check for null bytes which can be used in path attacks
    if (filePath.includes('\0')) {
      throw new Error('Invalid file path: null byte detected');
    }

    // Resolve to absolute path for validation
    const resolvedPath = path.resolve(filePath);
    const cwd = process.cwd();
    const isAbsolutePath = path.isAbsolute(filePath);

    // Security: For relative paths, ensure they resolve within cwd
    // For absolute paths, we allow them but this is a deliberate choice for flexibility
    // Users should be aware that absolute paths can access any readable file
    const isWithinCwd = resolvedPath.startsWith(cwd + path.sep) || resolvedPath === cwd;

    // If the user provided a relative path, ensure it resolves within cwd
    if (!isAbsolutePath && !isWithinCwd) {
      throw new Error('Invalid file path: resolved path is outside working directory');
    }

    // For absolute paths, warn in the error if file doesn't exist
    // This helps users understand they're using absolute paths

    try {
      // Open the file directly to avoid TOCTOU race condition
      // No existsSync check - handle errors during open instead
      const fd = fs.openSync(resolvedPath, 'r');
      try {
        const stats = fs.fstatSync(fd);
        if (stats.size > MAX_FILE_SIZE) {
          throw new Error(
            `File is too large: ${Math.round(stats.size / (1024 * 1024))}MB. Maximum allowed size is ${
              MAX_FILE_SIZE / (1024 * 1024)
            }MB`
          );
        }

        const content = fs.readFileSync(fd, 'utf-8');
        if (!content || content.trim().length === 0) {
          throw new Error(`File is empty: ${filePath}`);
        }
        return content;
      } finally {
        fs.closeSync(fd);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('ENOENT')) {
          const pathType = isAbsolutePath ? 'absolute' : 'relative';
          throw new Error(`File not found: ${filePath} (${pathType} path resolved to ${resolvedPath})`);
        }
        if (error.message.includes('EACCES')) {
          throw new Error(`Permission denied: ${filePath}`);
        }
        // Re-throw if it's already our custom error
        if (error.message.includes('File not found:') || error.message.includes('File is too large:')) {
          throw error;
        }
        throw new Error(`Failed to read diff file: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Read diff from stdin
   * @param options - Optional configuration for timeout and max size
   * @param options.timeoutMs - Timeout in milliseconds (default: from env or 30000ms)
   * @param options.maxSizeBytes - Maximum input size in bytes (default: from env or 10MB)
   * @returns The content read from stdin
   * @throws {Error} If stdin read fails, times out, or exceeds size limit
   * @example
   * ```typescript
   * const diff = await GitDiffExtractor.readDiffFromStdin();
   * // With custom timeout
   * const diff = await GitDiffExtractor.readDiffFromStdin({ timeoutMs: 60000 });
   * ```
   */
  static async readDiffFromStdin(options?: { timeoutMs?: number; maxSizeBytes?: number }): Promise<string> {
    return new Promise((resolve, reject) => {
      // Check if stdin is a TTY (terminal) - if so, there's no input
      if (process.stdin.isTTY) {
        reject(new Error('No input provided via stdin. Pipe a diff or use --file, --base/--head, or --uncommitted'));
        return;
      }

      let data = '';
      process.stdin.setEncoding('utf-8');

      // Configuration
      const envTimeoutMs = process.env.STDIN_TIMEOUT_MS ? Number(process.env.STDIN_TIMEOUT_MS) : undefined;
      const envMaxSizeBytes = process.env.STDIN_MAX_SIZE_BYTES ? Number(process.env.STDIN_MAX_SIZE_BYTES) : undefined;

      const resolvedTimeoutMs = options?.timeoutMs ?? envTimeoutMs;
      const resolvedMaxSizeBytes = options?.maxSizeBytes ?? envMaxSizeBytes;

      const timeoutMs =
        typeof resolvedTimeoutMs === 'number' && Number.isFinite(resolvedTimeoutMs) && resolvedTimeoutMs > 0
          ? resolvedTimeoutMs
          : 30000;

      const maxSizeBytes =
        typeof resolvedMaxSizeBytes === 'number' && Number.isFinite(resolvedMaxSizeBytes) && resolvedMaxSizeBytes > 0
          ? resolvedMaxSizeBytes
          : 10 * 1024 * 1024;
      // Set a timeout to prevent hanging indefinitely
      let timeout: NodeJS.Timeout | null = setTimeout(() => {
        cleanup();
        reject(new Error('Timeout waiting for stdin input'));
      }, timeoutMs);

      const clearTimeoutSafely = () => {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
      };

      // Clean up event listeners and timeout
      const cleanup = () => {
        clearTimeoutSafely();
        process.stdin.removeListener('data', onData);
        process.stdin.removeListener('end', onEnd);
        process.stdin.removeListener('error', onError);
      };

      const onData = (chunk: Buffer | string) => {
        data += chunk;
        // Enforce maximum size to avoid memory issues
        if (data.length > maxSizeBytes) {
          cleanup();
          reject(new Error(`Input exceeds maximum size of ${Math.round(maxSizeBytes / (1024 * 1024))}MB`));
          return;
        }
        // Reset timeout on data - extend by configured amount
        clearTimeoutSafely();
        timeout = setTimeout(() => {
          cleanup();
          reject(new Error('Timeout waiting for stdin input'));
        }, timeoutMs);
      };

      const onEnd = () => {
        cleanup();
        if (!data || data.trim().length === 0) {
          reject(new Error('No data received from stdin'));
          return;
        }
        resolve(data);
      };

      const onError = (error: Error) => {
        cleanup();
        reject(new Error(`Failed to read from stdin: ${error.message}`));
      };

      process.stdin.on('data', onData);
      process.stdin.on('end', onEnd);
      process.stdin.on('error', onError);
    });
  }
}
