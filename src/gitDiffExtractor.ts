/**
 * Git diff extraction utilities
 * Provides methods to extract git diffs from various sources
 */

import { simpleGit, SimpleGit } from 'simple-git';
import * as fs from 'fs';

/**
 * Utility class for extracting git diffs from various sources
 */
export class GitDiffExtractor {
  private git: SimpleGit;

  /**
   * Creates a new GitDiffExtractor instance
   * @param repoPath - Path to the git repository (defaults to current working directory)
   */
  constructor(repoPath: string = process.cwd()) {
    this.git = simpleGit(repoPath);
  }

  /**
   * Get diff between two branches or commits
   * @param base - Base branch or commit
   * @param head - Head branch or commit
   * @returns The git diff string
   * @throws Error if git operation fails
   */
  async getDiff(base: string, head: string): Promise<string> {
    if (!base || !head) {
      throw new Error('Both base and head must be provided');
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
   * @throws Error if git operation fails or no uncommitted changes exist
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
   * @throws Error if file cannot be read
   */
  static readDiffFromFile(filePath: string): string {
    if (!filePath) {
      throw new Error('File path is required');
    }

    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      const content = fs.readFileSync(filePath, 'utf-8');
      if (!content || content.trim().length === 0) {
        throw new Error(`File is empty: ${filePath}`);
      }
      return content;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('ENOENT')) {
          throw new Error(`File not found: ${filePath}`);
        }
        if (error.message.includes('EACCES')) {
          throw new Error(`Permission denied: ${filePath}`);
        }
        throw new Error(`Failed to read diff file: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Read diff from stdin
   * @returns The content read from stdin
   * @throws Error if stdin read fails
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
      const timeoutMs = options?.timeoutMs ?? (process.env.STDIN_TIMEOUT_MS ? Number(process.env.STDIN_TIMEOUT_MS) : 30000);
      const maxSizeBytes = options?.maxSizeBytes ?? (process.env.STDIN_MAX_SIZE_BYTES ? Number(process.env.STDIN_MAX_SIZE_BYTES) : 10 * 1024 * 1024);

      // Set a timeout to prevent hanging indefinitely
      let timeout: NodeJS.Timeout | null = setTimeout(() => {
        reject(new Error('Timeout waiting for stdin input'));
      }, timeoutMs);

      const clearTimeoutSafely = () => {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
      };

      process.stdin.on('data', (chunk) => {
        data += chunk;
        // Enforce maximum size to avoid memory issues
        if (data.length > maxSizeBytes) {
          clearTimeoutSafely();
          reject(new Error(`Input exceeds maximum size of ${Math.round(maxSizeBytes / (1024 * 1024))}MB`));
          return;
        }
        // Reset timeout on data - extend by configured amount
        clearTimeoutSafely();
        timeout = setTimeout(() => {
          reject(new Error('Timeout waiting for stdin input'));
        }, timeoutMs);
      });

      process.stdin.on('end', () => {
        clearTimeoutSafely();
        if (!data || data.trim().length === 0) {
          reject(new Error('No data received from stdin'));
          return;
        }
        resolve(data);
      });

      process.stdin.on('error', (error) => {
        clearTimeoutSafely();
        reject(new Error(`Failed to read from stdin: ${error.message}`));
      });
    });
  }
}
