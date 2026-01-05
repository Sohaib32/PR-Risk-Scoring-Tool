const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

// Load from dist after build
const { RiskSchema } = require(path.resolve(process.cwd(), 'dist', 'schema.js'));

test('RiskSchema validates correct risk assessment', () => {
  const validAssessment = {
    risk_level: 'MEDIUM',
    risk_summary: 'Some changes detected',
    risk_factors: ['Factor 1', 'Factor 2'],
    reviewer_focus_areas: ['Area 1', 'Area 2'],
    missing_tests: true,
    migration_risk: 'NONE'
  };

  const result = RiskSchema.safeParse(validAssessment);
  assert.ok(result.success, 'Valid assessment should pass validation');
});

test('RiskSchema rejects invalid risk_level', () => {
  const invalidAssessment = {
    risk_level: 'INVALID',
    risk_summary: 'Some changes',
    risk_factors: [],
    reviewer_focus_areas: [],
    missing_tests: false,
    migration_risk: 'NONE'
  };

  const result = RiskSchema.safeParse(invalidAssessment);
  assert.ok(!result.success, 'Invalid risk_level should fail validation');
});

test('RiskSchema rejects missing required fields', () => {
  const incompleteAssessment = {
    risk_level: 'LOW',
    // Missing risk_summary
    risk_factors: [],
    reviewer_focus_areas: [],
    missing_tests: false,
    migration_risk: 'NONE'
  };

  const result = RiskSchema.safeParse(incompleteAssessment);
  assert.ok(!result.success, 'Missing required field should fail validation');
});

test('RiskSchema accepts all valid risk levels', () => {
  ['LOW', 'MEDIUM', 'HIGH'].forEach((level) => {
    const assessment = {
      risk_level: level,
      risk_summary: 'Test',
      risk_factors: [],
      reviewer_focus_areas: [],
      missing_tests: false,
      migration_risk: 'NONE'
    };
    
    const result = RiskSchema.safeParse(assessment);
    assert.ok(result.success, `${level} should be a valid risk level`);
  });
});

test('RiskSchema accepts all valid migration risks', () => {
  ['NONE', 'LOW', 'HIGH'].forEach((migrationRisk) => {
    const assessment = {
      risk_level: 'LOW',
      risk_summary: 'Test',
      risk_factors: [],
      reviewer_focus_areas: [],
      missing_tests: false,
      migration_risk: migrationRisk
    };
    
    const result = RiskSchema.safeParse(assessment);
    assert.ok(result.success, `${migrationRisk} should be a valid migration risk`);
  });
});
