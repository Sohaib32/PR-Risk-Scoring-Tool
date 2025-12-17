const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

test('logger mocks console methods to avoid output during tests', () => {
  // Save original console methods
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  // Track calls to console methods
  const logCalls = [];
  const warnCalls = [];
  const errorCalls = [];

  // Mock console methods
  console.log = (...args) => logCalls.push(args);
  console.warn = (...args) => warnCalls.push(args);
  console.error = (...args) => errorCalls.push(args);

  try {
    // Import logger after mocking console
    const { logger } = require(path.resolve(process.cwd(), 'dist', 'utils', 'logger.js'));

    // Test info (default log level should be 'info')
    logger.info('test info message');
    assert.equal(logCalls.length, 1);
    assert.ok(logCalls[0].some(arg => String(arg).includes('info')));
    assert.ok(logCalls[0].some(arg => String(arg).includes('test info message')));

    // Test warn
    logger.warn('test warn message');
    assert.equal(warnCalls.length, 1);
    assert.ok(warnCalls[0].some(arg => String(arg).includes('warn')));
    assert.ok(warnCalls[0].some(arg => String(arg).includes('test warn message')));

    // Test error
    logger.error('test error message');
    assert.equal(errorCalls.length, 1);
    assert.ok(errorCalls[0].some(arg => String(arg).includes('error')));
    assert.ok(errorCalls[0].some(arg => String(arg).includes('test error message')));

    // Test debug (should not log at default 'info' level)
    logger.debug('test debug message');
    // logCalls should still be 1 (only the info call above)
    assert.equal(logCalls.length, 1);

  } finally {
    // Restore original console methods
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
  }
});

test('logger respects LOG_LEVEL environment variable', () => {
  // Save original console methods and env
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalLogLevel = process.env.LOG_LEVEL;

  // Track calls to console methods
  const logCalls = [];
  const warnCalls = [];
  const errorCalls = [];

  // Mock console methods
  console.log = (...args) => logCalls.push(args);
  console.warn = (...args) => warnCalls.push(args);
  console.error = (...args) => errorCalls.push(args);

  try {
    // Set LOG_LEVEL to 'debug'
    process.env.LOG_LEVEL = 'debug';

    // Clear the require cache to reload logger with new env
    const loggerPath = path.resolve(process.cwd(), 'dist', 'utils', 'logger.js');
    delete require.cache[loggerPath];
    
    const { logger } = require(loggerPath);

    // Test debug (should now log at 'debug' level)
    logger.debug('test debug message');
    assert.equal(logCalls.length, 1);
    assert.ok(logCalls[0].some(arg => String(arg).includes('debug')));
    assert.ok(logCalls[0].some(arg => String(arg).includes('test debug message')));

  } finally {
    // Restore original console methods and env
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
    if (originalLogLevel !== undefined) {
      process.env.LOG_LEVEL = originalLogLevel;
    } else {
      delete process.env.LOG_LEVEL;
    }

    // Clear the require cache again
    const loggerPath = path.resolve(process.cwd(), 'dist', 'utils', 'logger.js');
    delete require.cache[loggerPath];
  }
});
