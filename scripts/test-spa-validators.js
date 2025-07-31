#!/usr/bin/env node

import { loadProfile } from '../core/loaders.js';
import { runValidators } from '../core/runValidators.js';
import fs from 'fs/promises';
import path from 'path';

async function scanDirectory(dir) {
  const files = [];

  async function scan(currentDir) {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          await scan(fullPath);
        } else {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
  }

  await scan(dir);
  return files;
}

async function testSpaValidators() {
  console.log('🎼 Testing Symphonic Plugin Architecture (SPA) Validators\n');

  try {
    // Load the comprehensive SPA profile
    console.log('📋 Loading SPA comprehensive validation profile...');
    const profile = await loadProfile('spa-comprehensive');
    console.log(`✅ Loaded ${profile.validators.length} validators\n`);

    // Find SPA plugin test data
    console.log('🔍 Scanning for SPA plugin test data...');
    const testFiles = await scanDirectory('testdata/sample-plugins');

    console.log(`📁 Found ${testFiles.length} test files\n`);

    // Run validation
    console.log('🚀 Running SPA validation suite...\n');
    const results = await runValidators(profile.validators, testFiles);

    // Display results
    displayResults(results);

    // Generate summary
    generateSummary(results);

  } catch (error) {
    console.error('❌ Error running SPA validators:', error.message);
    process.exit(1);
  }
}

function displayResults(results) {
  console.log('📊 Validation Results:\n');
  console.log('═'.repeat(80));

  for (const result of results) {
    const status = result.passed ? '✅' : '❌';
    const validator = result.validator || 'Unknown';
    
    console.log(`${status} ${validator}`);
    console.log(`   ${result.message}`);
    
    if (result.details && result.details.length > 0) {
      result.details.forEach(detail => {
        console.log(`   📝 ${detail}`);
      });
    }
    
    if (result.warnings && result.warnings.length > 0) {
      result.warnings.forEach(warning => {
        console.log(`   ⚠️  ${warning}`);
      });
    }
    
    console.log('');
  }
  
  console.log('═'.repeat(80));
}

function generateSummary(results) {
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  
  console.log('\n📈 Summary:');
  console.log(`   Total Validators: ${total}`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📊 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n🔧 Failed Validators:');
    results.filter(r => !r.passed).forEach(result => {
      console.log(`   • ${result.validator}: ${result.message}`);
    });
  }

  // Categorize by validation level
  const criticalValidators = [
    'spa-structure',
    'spa-sequence-contract', 
    'spa-handler-mapping',
    'spa-index-manifest-sync'
  ];
  
  const criticalResults = results.filter(r => 
    criticalValidators.some(cv => r.validator && r.validator.includes(cv))
  );
  
  const criticalPassed = criticalResults.filter(r => r.passed).length;
  const criticalTotal = criticalResults.length;
  
  console.log(`\n🚨 Critical Validators: ${criticalPassed}/${criticalTotal} passed`);
  
  if (criticalPassed < criticalTotal) {
    console.log('   ⚠️  Critical validation failures detected!');
    console.log('   🔧 Fix critical issues before proceeding with SPA development.');
  } else {
    console.log('   ✅ All critical validations passed!');
    console.log('   🎉 SPA architecture compliance verified.');
  }
}

// Run the test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testSpaValidators().catch(console.error);
}

export { testSpaValidators };
