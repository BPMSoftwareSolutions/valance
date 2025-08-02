#!/usr/bin/env node

/**
 * MCO/MSO Implementation Test Runner
 * Executes comprehensive tests for Musical Conductor Orchestration
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🎼 MCO/MSO Implementation Test Runner");
console.log("====================================");

try {
  // Import and run the test suite
  const { MCOTestSuite } = await import('../testdata/RenderX/src/communication/sequences/MusicalConductor.mco-test.js');
  
  const testSuite = new MCOTestSuite();
  const results = await testSuite.runAllTests();
  
  // Exit with appropriate code
  if (results.passRate >= 80) {
    console.log("\n🎉 MCO/MSO Implementation tests PASSED!");
    process.exit(0);
  } else {
    console.log("\n❌ MCO/MSO Implementation tests FAILED!");
    process.exit(1);
  }
  
} catch (error) {
  console.error("❌ Failed to run MCO/MSO tests:", error);
  console.error("Stack trace:", error.stack);
  process.exit(1);
}
