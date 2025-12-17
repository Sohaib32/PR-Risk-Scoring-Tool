const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const LOGGER_PATH = path.resolve(process.cwd(), 'dist', 'utils', 'logger.js');

// Helper function to setup console mocks
function setupConsoleMocks() {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  const logCalls = [];
  const warnCalls = [];
  const errorCalls = [];

  console.log = (...args) => logCalls.push(args);
  console.warn = (...args) => warnCalls.push(args);
  console.error = (...args) => errorCalls.push(args);

  return {
    logCalls,
    warnCalls,
    errorCalls,
    restore: () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    }
  };
}

// Helper function to assert a console call's arguments contain expected text
function assertContains(callArgs, expectedText) {
  assert.ok(callArgs.some(arg => String(arg).includes(expectedText)));
}

test('logger mocks console methods to avoid output during tests', () => {
  const mocks = setupConsoleMocks();

  try {
    // Import logger after mocking console
    const { logger } = require(LOGGER_PATH);

    // Test info (default log level should be 'info')
    logger.info('test info message');
    assert.equal(mocks.logCalls.length, 1);
    assertContains(mocks.logCalls[0], 'info');
    assertContains(mocks.logCalls[0], 'test info message');

    // Test warn
    logger.warn('test warn message');
    assert.equal(mocks.warnCalls.length, 1);
    assertContains(mocks.warnCalls[0], 'warn');
    assertContains(mocks.warnCalls[0], 'test warn message');

    // Test error
    logger.error('test error message');
    assert.equal(mocks.errorCalls.length, 1);
    assertContains(mocks.errorCalls[0], 'error');
    assertContains(mocks.errorCalls[0], 'test error message');

    // Test debug (should not log at default 'info' level)
    logger.debug('test debug message');
    // logCalls should still be 1 (only the info call above)
    assert.equal(mocks.logCalls.length, 1);

  } finally {
    mocks.restore();
  }
});

test('logger respects LOG_LEVEL environment variable', () => {
  const mocks = setupConsoleMocks();
  const originalLogLevel = process.env.LOG_LEVEL;

  try {
    // Set LOG_LEVEL to 'debug'
    process.env.LOG_LEVEL = 'debug';

    // Clear the require cache to reload logger with new env
    delete require.cache[LOGGER_PATH];
    
    const { logger } = require(LOGGER_PATH);

    // Test debug (should now log at 'debug' level)
    logger.debug('test debug message');
    assert.equal(mocks.logCalls.length, 1);
    assertContains(mocks.logCalls[0], 'debug');
    assertContains(mocks.logCalls[0], 'test debug message');

  } finally {
    mocks.restore();
    if (originalLogLevel !== undefined) {
      process.env.LOG_LEVEL = originalLogLevel;
    } else {
      delete process.env.LOG_LEVEL;
    }

    // Clear the require cache again
    delete require.cache[LOGGER_PATH];
  }
});
