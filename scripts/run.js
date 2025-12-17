#!/usr/bin/env node

/**
 * Wrapper script to run the CLI with proper argument forwarding
 * This bypasses npm's argument parsing issues
 */

const { spawn } = require('child_process');
const path = require('path');

// Get all arguments after the script name
const args = process.argv.slice(2);

// Run the CLI - use require to directly execute
const cliPath = path.resolve(__dirname, '..', 'dist', 'cli.js');

// Use spawn with proper path handling
const child = spawn(process.execPath, [cliPath, ...args], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: process.env
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.error('Error running CLI:', error.message);
  process.exit(1);
});

