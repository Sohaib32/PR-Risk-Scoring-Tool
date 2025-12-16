/**
 * Git diff extraction utilities
 */

import { simpleGit, SimpleGit } from 'simple-git';
import * as fs from 'fs';

export class GitDiffExtractor {
  private git: SimpleGit;

  constructor(repoPath: string = process.cwd()) {
    this.git = simpleGit(repoPath);
  }

  /**
   * Get diff between two branches or commits
   */
  async getDiff(base: string, head: string): Promise<string> {
    try {
      const diff = await this.git.diff([base, head]);
      return diff;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get git diff: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get diff for uncommitted changes
   */
  async getUncommittedDiff(): Promise<string> {
    try {
      const diff = await this.git.diff();
      return diff;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get uncommitted diff: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get diff from a file
   */
  static readDiffFromFile(filePath: string): string {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to read diff file: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Read diff from stdin
   */
  static async readDiffFromStdin(): Promise<string> {
    return new Promise((resolve, reject) => {
      let data = '';
      process.stdin.setEncoding('utf-8');

      process.stdin.on('data', (chunk) => {
        data += chunk;
      });

      process.stdin.on('end', () => {
        resolve(data);
      });

      process.stdin.on('error', (error) => {
        reject(new Error(`Failed to read from stdin: ${error.message}`));
      });
    });
  }
}
