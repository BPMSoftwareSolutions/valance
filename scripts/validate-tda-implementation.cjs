#!/usr/bin/env node

/**
 * TDA Implementation Validator
 * 
 * Comprehensive validation script for the RenderX E2E TDA implementation
 * Validates all components of the Test-Driven Architecture enforcement system
 */

const fs = require('fs');
const path = require('path');
const { E2ETestPresenceValidator } = require('./test-e2e-validator.cjs');

class TDAImplementationValidator {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      validations: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
  }

  async validateAll() {
    console.log('🎯 TDA Implementation Validation Suite');
    console.log('=====================================\n');

    // 1. Validate E2E Validator exists
    await this.validateE2EValidator();

    // 2. Validate Playwright test structure
    await this.validatePlaywrightStructure();

    // 3. Validate RenderX DOM structure
    await this.validateRenderXDOMStructure();

    // 4. Validate SPA plugin architecture
    await this.validateSPAArchitecture();

    // 5. Validate CIA conductor integration
    await this.validateCIAIntegration();

    // 6. Validate JSON components
    await this.validateJSONComponents();

    // 7. Run E2E validator
    await this.runE2EValidator();

    // Print summary
    this.printSummary();

    return this.results.summary.failed === 0;
  }

  async validateE2EValidator() {
    const validation = {
      name: 'E2E Validator Presence',
      status: 'UNKNOWN',
      details: []
    };

    try {
      // Check C# validator
      const csValidator = 'migration/E2ETestPresenceValidator.cs';
      if (fs.existsSync(csValidator)) {
        validation.details.push('✅ C# E2E validator exists');
      } else {
        validation.details.push('❌ C# E2E validator missing');
      }

      // Check JS validator
      const jsValidator = 'scripts/test-e2e-validator.cjs';
      if (fs.existsSync(jsValidator)) {
        validation.details.push('✅ JavaScript E2E validator exists');
      } else {
        validation.details.push('❌ JavaScript E2E validator missing');
      }

      validation.status = validation.details.some(d => d.includes('❌')) ? 'FAILED' : 'PASSED';
    } catch (error) {
      validation.status = 'FAILED';
      validation.details.push(`❌ Error: ${error.message}`);
    }

    this.addValidation(validation);
  }

  async validatePlaywrightStructure() {
    const validation = {
      name: 'Playwright Test Structure',
      status: 'UNKNOWN',
      details: []
    };

    try {
      const testDir = 'testdata/RenderX/test';
      const requiredFiles = [
        'app.spec.ts',
        'global-setup.ts',
        'global-teardown.ts'
      ];

      if (!fs.existsSync(testDir)) {
        validation.status = 'FAILED';
        validation.details.push('❌ Test directory does not exist');
        this.addValidation(validation);
        return;
      }

      requiredFiles.forEach(file => {
        const filePath = path.join(testDir, file);
        if (fs.existsSync(filePath)) {
          validation.details.push(`✅ ${file} exists`);
        } else {
          validation.details.push(`❌ ${file} missing`);
        }
      });

      // Check Playwright config
      const configFile = 'testdata/RenderX/playwright.config.ts';
      if (fs.existsSync(configFile)) {
        validation.details.push('✅ playwright.config.ts exists');
      } else {
        validation.details.push('❌ playwright.config.ts missing');
      }

      validation.status = validation.details.some(d => d.includes('❌')) ? 'FAILED' : 'PASSED';
    } catch (error) {
      validation.status = 'FAILED';
      validation.details.push(`❌ Error: ${error.message}`);
    }

    this.addValidation(validation);
  }

  async validateRenderXDOMStructure() {
    const validation = {
      name: 'RenderX DOM Structure',
      status: 'UNKNOWN',
      details: []
    };

    try {
      const appFile = 'testdata/RenderX/src/App.tsx';
      if (!fs.existsSync(appFile)) {
        validation.status = 'FAILED';
        validation.details.push('❌ App.tsx does not exist');
        this.addValidation(validation);
        return;
      }

      const content = fs.readFileSync(appFile, 'utf8');
      const requiredIds = ['#component-library', '#canvas', '#control-panel'];
      const requiredAttributes = ['data-plugin-mounted="true"', 'data-component'];

      requiredIds.forEach(id => {
        const idPattern = new RegExp(`id="${id.substring(1)}"`);
        if (idPattern.test(content)) {
          validation.details.push(`✅ ${id} ID found`);
        } else {
          validation.details.push(`❌ ${id} ID missing`);
        }
      });

      requiredAttributes.forEach(attr => {
        if (content.includes(attr)) {
          validation.details.push(`✅ ${attr} attribute found`);
        } else {
          validation.details.push(`❌ ${attr} attribute missing`);
        }
      });

      // Check for component-button class generation
      if (content.includes('component-${element.type.toLowerCase()}')) {
        validation.details.push('✅ Component class generation found');
      } else {
        validation.details.push('❌ Component class generation missing');
      }

      validation.status = validation.details.some(d => d.includes('❌')) ? 'FAILED' : 'PASSED';
    } catch (error) {
      validation.status = 'FAILED';
      validation.details.push(`❌ Error: ${error.message}`);
    }

    this.addValidation(validation);
  }

  async validateSPAArchitecture() {
    const validation = {
      name: 'SPA Architecture Compliance',
      status: 'UNKNOWN',
      details: []
    };

    try {
      // Check for communication system
      const commDir = 'testdata/RenderX/src/communication';
      if (fs.existsSync(commDir)) {
        validation.details.push('✅ Communication system exists');
      } else {
        validation.details.push('❌ Communication system missing');
      }

      // Check for musical conductor
      const conductorFile = path.join(commDir, 'sequences/MusicalConductor.ts');
      if (fs.existsSync(conductorFile)) {
        validation.details.push('✅ Musical Conductor exists');
      } else {
        validation.details.push('❌ Musical Conductor missing');
      }

      // Check for plugin system
      const servicesDir = 'testdata/RenderX/src/services';
      if (fs.existsSync(servicesDir)) {
        validation.details.push('✅ Services directory exists');
      } else {
        validation.details.push('❌ Services directory missing');
      }

      validation.status = validation.details.some(d => d.includes('❌')) ? 'FAILED' : 'PASSED';
    } catch (error) {
      validation.status = 'FAILED';
      validation.details.push(`❌ Error: ${error.message}`);
    }

    this.addValidation(validation);
  }

  async validateCIAIntegration() {
    const validation = {
      name: 'CIA Integration Compliance',
      status: 'UNKNOWN',
      details: []
    };

    try {
      const appFile = 'testdata/RenderX/src/App.tsx';
      const content = fs.readFileSync(appFile, 'utf8');

      // Check for conductor initialization
      if (content.includes('initializeCommunicationSystem')) {
        validation.details.push('✅ Communication system initialization found');
      } else {
        validation.details.push('❌ Communication system initialization missing');
      }

      // Check for musical conductor usage
      if (content.includes('MusicalConductor')) {
        validation.details.push('✅ Musical Conductor usage found');
      } else {
        validation.details.push('❌ Musical Conductor usage missing');
      }

      // Check for sequence execution
      if (content.includes('startSequence') || content.includes('loadAllComponentsMusical')) {
        validation.details.push('✅ Sequence execution found');
      } else {
        validation.details.push('❌ Sequence execution missing');
      }

      validation.status = validation.details.some(d => d.includes('❌')) ? 'FAILED' : 'PASSED';
    } catch (error) {
      validation.status = 'FAILED';
      validation.details.push(`❌ Error: ${error.message}`);
    }

    this.addValidation(validation);
  }

  async validateJSONComponents() {
    const validation = {
      name: 'JSON Components Structure',
      status: 'UNKNOWN',
      details: []
    };

    try {
      const componentsDir = 'testdata/RenderX/public/json-components';
      if (!fs.existsSync(componentsDir)) {
        validation.status = 'FAILED';
        validation.details.push('❌ JSON components directory missing');
        this.addValidation(validation);
        return;
      }

      const files = fs.readdirSync(componentsDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));

      if (jsonFiles.length === 0) {
        validation.details.push('⚠️  No JSON component files found');
      } else {
        validation.details.push(`✅ Found ${jsonFiles.length} JSON component files`);
      }

      // Check for button component specifically
      if (jsonFiles.includes('button.json')) {
        validation.details.push('✅ Button component exists');
        
        // Validate button component structure
        const buttonFile = path.join(componentsDir, 'button.json');
        const buttonContent = JSON.parse(fs.readFileSync(buttonFile, 'utf8'));
        
        if (buttonContent.metadata && buttonContent.metadata.type === 'Button') {
          validation.details.push('✅ Button component has correct type');
        } else {
          validation.details.push('❌ Button component type incorrect');
        }
      } else {
        validation.details.push('❌ Button component missing');
      }

      validation.status = validation.details.some(d => d.includes('❌')) ? 'FAILED' : 'PASSED';
    } catch (error) {
      validation.status = 'FAILED';
      validation.details.push(`❌ Error: ${error.message}`);
    }

    this.addValidation(validation);
  }

  async runE2EValidator() {
    const validation = {
      name: 'E2E Validator Execution',
      status: 'UNKNOWN',
      details: []
    };

    try {
      const validator = new E2ETestPresenceValidator();
      const result = await validator.validateWithPlaywrightExecution();

      if (result.errors.length === 0) {
        validation.status = 'PASSED';
        validation.details.push('✅ E2E validator passed all checks');
        validation.details.push(`✅ ${result.success.length} success messages`);
      } else {
        validation.status = 'FAILED';
        validation.details.push(`❌ E2E validator found ${result.errors.length} errors`);
        result.errors.forEach(error => {
          validation.details.push(`   - ${error}`);
        });
      }

      if (result.warnings.length > 0) {
        validation.details.push(`⚠️  ${result.warnings.length} warnings found`);
      }
    } catch (error) {
      validation.status = 'FAILED';
      validation.details.push(`❌ Error running E2E validator: ${error.message}`);
    }

    this.addValidation(validation);
  }

  addValidation(validation) {
    this.results.validations.push(validation);
    this.results.summary.total++;
    
    if (validation.status === 'PASSED') {
      this.results.summary.passed++;
    } else if (validation.status === 'FAILED') {
      this.results.summary.failed++;
    }
    
    if (validation.details.some(d => d.includes('⚠️'))) {
      this.results.summary.warnings++;
    }

    // Print validation result
    const statusIcon = validation.status === 'PASSED' ? '✅' : 
                      validation.status === 'FAILED' ? '❌' : '❓';
    console.log(`${statusIcon} ${validation.name}: ${validation.status}`);
    validation.details.forEach(detail => {
      console.log(`   ${detail}`);
    });
    console.log('');
  }

  printSummary() {
    console.log('📊 TDA Implementation Validation Summary');
    console.log('========================================');
    console.log(`🕒 Timestamp: ${this.results.timestamp}`);
    console.log(`📈 Total Validations: ${this.results.summary.total}`);
    console.log(`✅ Passed: ${this.results.summary.passed}`);
    console.log(`❌ Failed: ${this.results.summary.failed}`);
    console.log(`⚠️  Warnings: ${this.results.summary.warnings}`);
    console.log('');

    const overallStatus = this.results.summary.failed === 0 ? 'PASS' : 'FAIL';
    const statusIcon = overallStatus === 'PASS' ? '🎉' : '💥';
    
    console.log(`${statusIcon} Overall TDA Implementation Status: ${overallStatus}`);
    
    if (overallStatus === 'PASS') {
      console.log('');
      console.log('🎯 TDA Implementation Complete!');
      console.log('✅ E2E validator enforcement is working');
      console.log('✅ Playwright tests validate architecture');
      console.log('✅ RenderX app follows CIA/SPA patterns');
      console.log('✅ DOM elements have required IDs');
      console.log('✅ Drag and drop functionality implemented');
    } else {
      console.log('');
      console.log('🔄 TDA Loop: Additional refactoring required');
      console.log('Please address the failed validations above');
    }
  }
}

// CLI execution
async function main() {
  const validator = new TDAImplementationValidator();
  const success = await validator.validateAll();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ TDA validation failed:', error);
    process.exit(1);
  });
}

module.exports = { TDAImplementationValidator };
