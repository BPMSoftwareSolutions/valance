#!/usr/bin/env node

/**
 * E2E Test Presence Validator (JavaScript Implementation)
 * 
 * JavaScript version of the E2ETestPresenceValidator.cs for testing
 * Validates that proper Playwright E2E tests exist for RenderX application
 */

const fs = require('fs');
const path = require('path');

class E2ETestPresenceValidator {
  constructor(projectRoot = './testdata/RenderX') {
    this.projectRoot = projectRoot;
    this.testDirectory = path.join(projectRoot, 'test');
  }

  validateE2ETestPresence() {
    const result = {
      validatorName: 'E2ETestPresenceValidator',
      componentName: 'RenderX',
      timestamp: new Date().toISOString(),
      errors: [],
      warnings: [],
      info: [],
      success: []
    };

    try {
      // Check if test directory exists
      if (!fs.existsSync(this.testDirectory)) {
        result.errors.push(`E2E test directory not found: ${this.testDirectory}`);
        result.errors.push('TDA Requirement: E2E tests must exist to validate architecture');
        return result;
      }

      // Find Playwright test files
      const testFiles = this.findTestFiles(this.testDirectory);

      if (testFiles.length === 0) {
        result.errors.push('No Playwright test files found (*.spec.ts or *.test.ts)');
        result.errors.push('TDA Requirement: app.spec.ts must exist with E2E validations');
        return result;
      }

      // Validate each test file
      testFiles.forEach(testFile => {
        this.validateTestFile(testFile, result);
      });

      // Check for required test file
      const appSpecFile = path.join(this.testDirectory, 'app.spec.ts');
      if (!fs.existsSync(appSpecFile)) {
        result.warnings.push('app.spec.ts not found - this is the recommended main test file');
      }

      if (result.errors.length === 0) {
        result.success.push('E2E test presence validation passed');
        result.success.push('TDA compliance: E2E tests properly validate architecture');
      }
    } catch (error) {
      result.errors.push(`Validation failed with exception: ${error.message}`);
    }

    return result;
  }

  findTestFiles(directory) {
    const testFiles = [];
    
    const scanDirectory = (dir) => {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          scanDirectory(filePath);
        } else if (file.endsWith('.spec.ts') || file.endsWith('.test.ts')) {
          testFiles.push(filePath);
        }
      });
    };

    scanDirectory(directory);
    return testFiles;
  }

  validateTestFile(testFilePath, result) {
    const fileName = path.basename(testFilePath);
    const content = fs.readFileSync(testFilePath, 'utf8');

    // Check for Playwright imports
    if (!content.includes('@playwright/test') && !content.includes('playwright')) {
      result.errors.push(`${fileName}: Missing Playwright imports`);
      return;
    }

    // Check for localhost:3000 navigation
    if (!/goto\s*\(\s*['"]http:\/\/localhost:3000['"]/.test(content)) {
      result.errors.push(`${fileName}: Missing navigation to http://localhost:3000`);
    }

    // Check for required DOM element assertions
    const requiredElements = ['#component-library', '#canvas', '#control-panel'];
    requiredElements.forEach(element => {
      if (!content.includes(element)) {
        result.errors.push(`${fileName}: Missing assertion for DOM element: ${element}`);
      }
    });

    // Check for drag and drop simulation
    if (!content.includes('data-component="button"')) {
      result.errors.push(`${fileName}: Missing drag simulation for data-component="button"`);
    }

    // Check for canvas drop validation
    if (!content.includes('.component-button')) {
      result.errors.push(`${fileName}: Missing validation for .component-button in canvas`);
    }

    // Check for proper test structure
    if (!content.includes('test(') && !content.includes('it(')) {
      result.errors.push(`${fileName}: Missing test function declarations`);
    }

    // Validate test describes the E2E scenario
    if (!/(?:test|it)\s*\(\s*['"][^'"]*drag[^'"]*['"]/.test(content)) {
      result.warnings.push(`${fileName}: Test should describe drag and drop scenario`);
    }

    result.info.push(`${fileName}: E2E test file validated`);
  }

  async validateWithPlaywrightExecution() {
    const result = this.validateE2ETestPresence();
    
    if (result.errors.length > 0) {
      return result;
    }

    // Additional validation: Check if Playwright config exists
    const playwrightConfig = path.join(this.projectRoot, 'playwright.config.ts');
    if (!fs.existsSync(playwrightConfig)) {
      result.warnings.push('playwright.config.ts not found - recommended for proper test configuration');
    }

    // Check package.json for Playwright dependencies
    const packageJson = path.join(this.projectRoot, 'package.json');
    if (fs.existsSync(packageJson)) {
      const packageContent = fs.readFileSync(packageJson, 'utf8');
      if (!packageContent.includes('@playwright/test')) {
        result.errors.push('package.json missing @playwright/test dependency');
      }
    } else {
      result.errors.push('package.json not found in RenderX project');
    }

    return result;
  }
}

// CLI execution
async function main() {
  console.log('🎭 Running E2E Test Presence Validator...\n');
  
  const validator = new E2ETestPresenceValidator();
  const result = await validator.validateWithPlaywrightExecution();
  
  // Print results
  console.log(`📊 Validation Results for ${result.componentName}:`);
  console.log(`🕒 Timestamp: ${result.timestamp}\n`);
  
  if (result.success.length > 0) {
    console.log('✅ Success:');
    result.success.forEach(msg => console.log(`   ${msg}`));
    console.log('');
  }
  
  if (result.info.length > 0) {
    console.log('ℹ️  Info:');
    result.info.forEach(msg => console.log(`   ${msg}`));
    console.log('');
  }
  
  if (result.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    result.warnings.forEach(msg => console.log(`   ${msg}`));
    console.log('');
  }
  
  if (result.errors.length > 0) {
    console.log('❌ Errors:');
    result.errors.forEach(msg => console.log(`   ${msg}`));
    console.log('');
  }
  
  const isValid = result.errors.length === 0;
  console.log(`🎯 Overall Result: ${isValid ? 'PASS' : 'FAIL'}`);
  
  if (!isValid) {
    console.log('\n🔄 TDA Loop: Refactoring required to pass validation');
    process.exit(1);
  } else {
    console.log('\n🎉 TDA Validation Complete: E2E tests properly validate architecture');
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Validator execution failed:', error);
    process.exit(1);
  });
}

module.exports = { E2ETestPresenceValidator };
