const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

// Note: Tests require the project to be built first (npm run build)
// This is handled automatically by the npm test script
const { GitDiffExtractor } = require(path.resolve(process.cwd(), 'dist', 'gitDiffExtractor.js'));

test('readDiffFromFile returns content for valid file', () => {
  const diffPath = path.resolve(process.cwd(), 'examples', 'sample-diff.txt');
  const content = GitDiffExtractor.readDiffFromFile(diffPath);
  assert.equal(typeof content, 'string');
  assert.ok(content.length > 0);
});

test('readDiffFromFile throws for missing file', () => {
  const missing = path.resolve(process.cwd(), 'examples', 'nope-missing-file.diff');
  assert.throws(() => GitDiffExtractor.readDiffFromFile(missing));
});
