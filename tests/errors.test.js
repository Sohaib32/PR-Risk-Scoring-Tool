const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { isError, getErrorMessage, isSizeLimitError } = require(path.resolve(process.cwd(), 'dist', 'types', 'errors.js'));

test('isError returns true for Error instances', () => {
  const error = new Error('test error');
  assert.ok(isError(error));
});

test('isError returns false for non-Error values', () => {
  assert.ok(!isError('string'));
  assert.ok(!isError(123));
  assert.ok(!isError(null));
  assert.ok(!isError(undefined));
  assert.ok(!isError({}));
});

test('getErrorMessage extracts message from Error', () => {
  const error = new Error('test message');
  assert.equal(getErrorMessage(error), 'test message');
});

test('getErrorMessage handles string errors', () => {
  assert.equal(getErrorMessage('string error'), 'string error');
});

test('getErrorMessage handles non-Error objects', () => {
  const result = getErrorMessage({ foo: 'bar' });
  assert.ok(typeof result === 'string');
});

test('isSizeLimitError detects 413 error code', () => {
  const error = new Error('413 Request Too Large');
  assert.ok(isSizeLimitError(error));
});

test('isSizeLimitError detects token limit messages', () => {
  const error1 = new Error('tokens per minute exceeded');
  assert.ok(isSizeLimitError(error1));
  
  const error2 = new Error('request too large');
  assert.ok(isSizeLimitError(error2));
});

test('isSizeLimitError returns false for normal errors', () => {
  const error = new Error('normal error');
  assert.ok(!isSizeLimitError(error));
});

test('isSizeLimitError returns false for non-Error values', () => {
  assert.ok(!isSizeLimitError('string'));
  assert.ok(!isSizeLimitError(null));
});
