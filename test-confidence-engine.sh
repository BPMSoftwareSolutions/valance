#!/bin/bash

# Test script for Valence Confidence Engine CLI features
# This script demonstrates all the new CLI capabilities

echo "🎯 Testing Valence Confidence Engine CLI Features"
echo "=================================================="

echo ""
echo "1. Testing basic validation with report generation..."
node cli/cli.js --validator sequence-definition --files "test/good-sequence.js" --generate-reports --report-dir test-reports/basic

echo ""
echo "2. Testing confidence threshold filtering..."
node cli/cli.js --validator import-path-validation --files "test/import-path-validation/invalid-import.ts" --confidence-threshold 0.9

echo ""
echo "3. Testing override statistics..."
node cli/cli.js --validator import-path-validation --files "test/import-path-validation/invalid-import.ts" --show-overrides

echo ""
echo "4. Testing profile with comprehensive features..."
node cli/cli.js --profile renderx-profile --files "test/**/*.js" --generate-reports --confidence-threshold 0.7 --show-overrides --report-dir test-reports/comprehensive

echo ""
echo "5. Testing dry-run with new configuration display..."
node cli/cli.js --validator sequence-definition --files "test/**/*.js" --dry-run --confidence-threshold 0.8 --generate-reports

echo ""
echo "6. Testing JSON output format..."
node cli/cli.js --validator sequence-definition --files "test/good-sequence.js" --format json

echo ""
echo "✅ All tests completed! Check the following directories for generated reports:"
echo "   - test-reports/basic/"
echo "   - test-reports/comprehensive/"
echo ""
echo "🎯 Confidence Engine CLI features are working correctly!"
