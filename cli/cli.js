
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { runValidators } from '../core/runValidators.js';
import { loadProfile, loadValidator, loadValidators } from '../core/loaders.js';
import { glob } from 'glob';
import fs from 'fs/promises';
import path from 'path';

const argv = yargs(hideBin(process.argv))
  .option('profile', {
    alias: 'p',
    type: 'string',
    description: 'Run validators from a specific profile'
  })
  .option('validator', {
    alias: 'v',
    type: 'string',
    description: 'Run a single validator'
  })
  .option('validators', {
    alias: 'vs',
    type: 'array',
    description: 'Run multiple specific validators'
  })
  .option('files', {
    alias: 'f',
    type: 'string',
    description: 'File pattern to validate (glob pattern)',
    default: '**/*'
  })
  .option('dry-run', {
    alias: 'd',
    type: 'boolean',
    description: 'Show what would be validated without running',
    default: false
  })
  .option('format', {
    type: 'string',
    choices: ['json', 'table'],
    description: 'Output format',
    default: 'table'
  })
  .help()
  .argv;

async function main() {
  try {
    let validators = [];
    
    // Load validators based on options
    if (argv.profile) {
      const profile = await loadProfile(argv.profile);
      validators = profile.validators;
      console.log(`Loaded profile: ${argv.profile} (${validators.length} validators)`);
    } else if (argv.validator) {
      const validator = await loadValidator(argv.validator);
      validators = [validator];
      console.log(`Loaded validator: ${argv.validator}`);
    } else if (argv.validators) {
      validators = await loadValidators(argv.validators);
      console.log(`Loaded ${validators.length} validators`);
    } else {
      console.error('Please specify --profile, --validator, or --validators');
      process.exit(1);
    }

    // Get files to validate
    const files = await glob(argv.files, { ignore: ['node_modules/**', '.git/**'] });
    console.log(`Found ${files.length} files matching pattern: ${argv.files}`);

    if (argv.dryRun) {
      console.log('\n=== DRY RUN MODE ===');
      console.log('Validators to run:');
      validators.forEach((v, i) => {
        console.log(`  ${i + 1}. ${v.name} (${v.type})`);
      });
      console.log(`\nFiles to validate: ${files.length} files`);
      return;
    }

    // Run validation
    const results = await runValidators(validators, files);
    
    // Output results
    if (argv.format === 'json') {
      console.log(JSON.stringify(results, null, 2));
    } else {
      displayTableResults(results);
    }

    // Exit with error code if any validations failed
    const hasFailures = results.some(r => !r.passed);
    process.exit(hasFailures ? 1 : 0);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

function displayTableResults(results) {
  console.log('\n=== VALIDATION RESULTS ===');
  
  let passed = 0;
  let failed = 0;
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.validator} - ${result.message}`);
    
    if (result.details && result.details.length > 0) {
      result.details.forEach(detail => {
        console.log(`    ${detail}`);
      });
    }
    
    if (result.passed) passed++;
    else failed++;
  });
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${results.length}`);
}

main();

