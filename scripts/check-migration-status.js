#!/usr/bin/env node

/**
 * Migration Status Checker
 * Quickly check which C# validators have been migrated to JavaScript
 */

import fs from 'fs/promises';
import path from 'path';

const VALIDATORS = [
  'ImportPathValidator',
  'IntegrationFlowValidator', 
  'LegacyImportDetector',
  'RuntimeBindingValidator',
  'SequenceRegistrationValidator',
  'SequenceStartDataExtractor',
  'SequenceValidator',
  'SingleSymphonyValidator',
  'ViolationAutoFixer',
  'ArchitectureViolationDetector',
  'ConductorTransformationAnalyzer',
  'CrossComponentEventValidator',
  'DataContractValidator',
  'DataFlowValidator',
  'EventTypeValidator',
  'ExportCompletenessValidator',
  'FunctionAvailabilityValidator',
  'HandlerContractExtractor'
];

// Known migration mappings
const MIGRATION_MAP = {
  'ImportPathValidator': 'plugins/validateImports.js',
  'IntegrationFlowValidator': 'plugins/validateIntegrationFlow.js',
  'RuntimeBindingValidator': 'plugins/validateRuntimeBinding.js',
  'SequenceRegistrationValidator': 'plugins/validateSequenceRegistration.js',
  'SequenceValidator': 'plugins/validateSequenceRequiredFields.js', // Representative of the suite
  'EventTypeValidator': 'plugins/validateSequenceEventTypes.js'
};

async function checkMigrationStatus() {
  console.log('🔄 Valence Migration Status Checker');
  console.log('=====================================\n');

  let migrated = 0;
  let total = VALIDATORS.length;

  for (const validator of VALIDATORS) {
    const csharpPath = `migration/${validator}.cs`;

    try {
      // Check if C# source exists
      await fs.access(csharpPath);
      const hasCSharp = '✅';

      // Check if JavaScript plugin exists
      let hasJS = '❌';
      let jsPath = '';

      // Check known migration mapping first
      if (MIGRATION_MAP[validator]) {
        try {
          await fs.access(MIGRATION_MAP[validator]);
          hasJS = '✅';
          jsPath = MIGRATION_MAP[validator];
          migrated++;
        } catch {}
      }

      // If not found, try common patterns
      if (hasJS === '❌') {
        const patterns = [
          `plugins/validate${validator.replace('Validator', '').replace('Detector', '').replace('Extractor', '').replace('Analyzer', '').replace('Fixer', '')}.js`,
          `plugins/validateSequence${validator.replace('Validator', '').replace('EventType', 'EventTypes')}.js`,
          `plugins/validate${validator.replace('Validator', '')}.js`,
          `plugins/${validator.toLowerCase()}.js`
        ];

        for (const pattern of patterns) {
          try {
            await fs.access(pattern);
            hasJS = '✅';
            jsPath = pattern;
            migrated++;
            break;
          } catch {}
        }
      }

      const status = hasJS === '✅' ? '🟢 MIGRATED' : '🔴 PENDING';
      const pathInfo = jsPath ? ` (${jsPath})` : '';
      console.log(`${status.padEnd(12)} ${validator.padEnd(30)} C#: ${hasCSharp} JS: ${hasJS}${pathInfo}`);

    } catch {
      console.log(`🟡 MISSING    ${validator.padEnd(30)} C#: ❌ JS: ❌`);
    }
  }

  console.log('\n=====================================');
  console.log(`📊 Migration Progress: ${migrated}/${total} (${Math.round(migrated/total*100)}%)`);
  console.log(`✅ Migrated: ${migrated}`);
  console.log(`❌ Pending: ${total - migrated}`);
  
  if (migrated === total) {
    console.log('\n🎉 All validators have been migrated!');
  } else {
    console.log(`\n🎯 Next priorities: Check the Migration wiki for roadmap`);
    console.log(`📖 Wiki: docs/wiki/Migration/C#-to-JavaScript-Migration-Status.md`);
  }
}

checkMigrationStatus().catch(console.error);
