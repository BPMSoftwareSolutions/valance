
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { runValidators } from '../core/runValidators.js';
import { loadProfile, loadValidator, loadValidators } from '../core/loaders.js';
import { generateReports } from '../core/reportGenerator.js';
import { OverrideManager } from '../core/overrideManager.js';
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
  .option('generate-reports', {
    type: 'boolean',
    description: 'Generate comprehensive reports (HTML, Markdown, JSON)',
    default: false
  })
  .option('report-dir', {
    type: 'string',
    description: 'Custom report directory',
    default: 'reports'
  })
  .option('confidence-threshold', {
    type: 'number',
    description: 'Filter violations by confidence level (0.0-1.0)',
    default: null
  })
  .option('apply-overrides', {
    type: 'boolean',
    description: 'Apply false positive overrides',
    default: true
  })
  .option('show-overrides', {
    type: 'boolean',
    description: 'Show override statistics',
    default: false
  })
  .help()
  .argv;

/**
 * Load configuration from .valencerc file
 */
async function loadConfig() {
  try {
    const configPath = '.valencerc';
    const content = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    // Return default config if file doesn't exist
    return {
      confidenceThreshold: 0.7,
      reportOptions: {
        includeCodeSnippets: true,
        showLowConfidence: true,
        generateReports: false,
        reportDir: 'reports'
      }
    };
  }
}

/**
 * Filter violations by confidence threshold
 */
function filterViolationsByConfidence(results, threshold) {
  if (!threshold) return results;

  return results.map(result => {
    if (!result.violations) return result;

    const filteredViolations = result.violations.filter(v =>
      (v.confidence || 1.0) >= threshold
    );

    return {
      ...result,
      violations: filteredViolations,
      passed: result.passed && filteredViolations.length === 0
    };
  });
}

/**
 * Apply overrides to filter out false positives
 */
async function applyOverrides(results, overrideManager) {
  return results.map(result => {
    if (!result.violations) return result;

    const filteredViolations = result.violations.filter(violation => {
      return !overrideManager.isOverridden(violation, violation.filePath || result.filePath);
    });

    return {
      ...result,
      violations: filteredViolations,
      passed: result.passed && filteredViolations.length === 0
    };
  });
}

async function main() {
  try {
    // Load configuration
    const config = await loadConfig();

    // Initialize override manager
    const overrideManager = new OverrideManager();
    await overrideManager.loadOverrides();

    // Determine confidence threshold (CLI arg overrides config)
    const confidenceThreshold = argv.confidenceThreshold !== null
      ? argv.confidenceThreshold
      : config.confidenceThreshold;

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
      console.log(`\nConfiguration:`);
      console.log(`  Confidence threshold: ${confidenceThreshold}`);
      console.log(`  Apply overrides: ${argv.applyOverrides}`);
      console.log(`  Generate reports: ${argv.generateReports}`);
      console.log(`  Report directory: ${argv.reportDir}`);
      return;
    }

    // Run validation
    let results = await runValidators(validators, files);

    // Apply overrides if enabled
    if (argv.applyOverrides) {
      results = await applyOverrides(results, overrideManager);
    }

    // Filter by confidence threshold if specified
    if (confidenceThreshold) {
      results = filterViolationsByConfidence(results, confidenceThreshold);
    }

    // Show override statistics if requested
    if (argv.showOverrides) {
      displayOverrideStatistics(overrideManager);
    }

    // Generate reports if requested
    if (argv.generateReports) {
      const reportOptions = {
        confidenceThreshold: confidenceThreshold || 0.7,
        includeCodeSnippets: config.reportOptions?.includeCodeSnippets !== false,
        showLowConfidence: config.reportOptions?.showLowConfidence !== false,
        totalFilesAnalyzed: files.length
      };

      await generateReports(results, argv.reportDir, reportOptions);
      console.log(`\n📊 Reports generated in: ${argv.reportDir}/`);
      console.log(`  - validation-report.html (interactive dashboard)`);
      console.log(`  - validation-report.md (detailed analysis)`);
      console.log(`  - validation-report.json (structured data)`);
    }

    // Output results
    if (argv.format === 'json') {
      console.log(JSON.stringify(results, null, 2));
    } else {
      displayTableResults(results, confidenceThreshold);
    }

    // Exit with error code if any validations failed
    const hasFailures = results.some(r => !r.passed);
    process.exit(hasFailures ? 1 : 0);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

function displayTableResults(results, confidenceThreshold) {
  console.log('\n=== VALIDATION RESULTS ===');

  let passed = 0;
  let failed = 0;
  let totalViolations = 0;
  let lowConfidenceCount = 0;

  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.validator} - ${result.message}`);

    // Display violations with confidence scores
    if (result.violations && result.violations.length > 0) {
      totalViolations += result.violations.length;

      result.violations.forEach((violation, index) => {
        const confidence = violation.confidence || 1.0;
        const confidenceText = `${(confidence * 100).toFixed(0)}%`;
        const severityIcon = getSeverityIcon(violation.severity);
        const isLowConfidence = confidence < (confidenceThreshold || 0.7);

        if (isLowConfidence) lowConfidenceCount++;

        console.log(`    ${severityIcon} ${violation.rule || 'Violation'} (Line ${violation.line || 'N/A'})`);
        console.log(`      Confidence: ${confidenceText} | ${violation.message}`);

        if (violation.code) {
          console.log(`      Code: ${violation.code}`);
        }

        if (violation.autoFixSuggestion) {
          console.log(`      💡 Suggested fix: ${violation.autoFixSuggestion}`);
        }

        if (isLowConfidence) {
          console.log(`      ⚠️ This rule may require manual verification.`);
        }
      });
    }

    // Display legacy details format for backward compatibility
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

  if (totalViolations > 0) {
    console.log(`\n🎯 Confidence Analysis`);
    console.log(`Total Violations: ${totalViolations}`);
    if (lowConfidenceCount > 0) {
      console.log(`⚠️ ${lowConfidenceCount} violations have low confidence and may require manual verification.`);
    }
  }
}

function getSeverityIcon(severity) {
  switch (severity?.toLowerCase()) {
    case 'error': return '🟥';
    case 'warning': return '🟨';
    case 'info': return '🟦';
    default: return '🟥';
  }
}

function displayOverrideStatistics(overrideManager) {
  const overrides = overrideManager.listOverrides();
  const stats = overrideManager.getOverrideStatistics();

  console.log(`\n📋 Override Statistics`);
  console.log(`Total overrides: ${stats.total}`);
  console.log(`Recent additions (last 7 days): ${stats.recent}`);

  if (Object.keys(stats.byRule).length > 0) {
    console.log(`\nBy rule:`);
    Object.entries(stats.byRule).forEach(([rule, count]) => {
      console.log(`  - ${rule}: ${count}`);
    });
  }

  if (overrides.length > 0) {
    console.log(`\nRecent overrides:`);
    overrides.slice(-3).forEach(override => {
      console.log(`  - ${override.rule} in ${override.filePath} (${override.status})`);
      console.log(`    Reason: ${override.reason}`);
    });
  }
}

main();

