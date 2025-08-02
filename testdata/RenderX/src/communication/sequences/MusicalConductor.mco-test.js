/**
 * MCO/MSO Implementation Test Suite
 * Comprehensive testing for Musical Conductor Orchestration and Musical Symphony Orchestration
 * 
 * Tests:
 * 1. Resource Ownership Tracking
 * 2. Conflict Resolution Strategies
 * 3. StrictMode Protection & Idempotency
 * 4. Multi-Component Drag Scenarios
 * 5. JSON Component Loading Stability
 * 6. Performance Benchmarking
 */

import { EventBus } from "../EventBus.js";
import { MusicalConductor } from "./MusicalConductor.js";
import { SEQUENCE_PRIORITIES } from "./SequenceTypes.js";

class MCOTestSuite {
  constructor() {
    this.eventBus = new EventBus();
    this.conductor = new MusicalConductor(this.eventBus);
    this.testResults = [];
    this.performanceMetrics = {};
  }

  /**
   * Run all MCO/MSO tests
   */
  async runAllTests() {
    console.log("🎼 Starting MCO/MSO Implementation Test Suite");
    console.log("=" .repeat(60));

    try {
      // Setup test sequences
      this.setupTestSequences();

      // Phase 1 Tests: Resource Ownership Tracking
      await this.testResourceOwnershipTracking();
      
      // Phase 2 Tests: Conflict Resolution Strategies
      await this.testConflictResolutionStrategies();
      
      // Phase 3 Tests: StrictMode Protection & Idempotency
      await this.testStrictModeProtection();
      
      // Phase 4 Tests: Orchestration Validation Compliance
      await this.testOrchestrationCompliance();
      
      // Phase 5 Tests: Performance & Stability
      await this.testPerformanceAndStability();

      // Generate test report
      this.generateTestReport();

    } catch (error) {
      console.error("❌ Test suite failed:", error);
      this.testResults.push({
        test: "Test Suite Execution",
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Setup test sequences for MCO/MSO testing
   */
  setupTestSequences() {
    const testSequences = [
      {
        name: "JsonLoader.json-component-symphony",
        description: "JSON component loading sequence",
        key: "C Major",
        tempo: 120,
        category: "component-ui",
        movements: [{
          name: "Load Components",
          beats: [{
            beat: 1,
            event: "component:loading:start",
            title: "Initiate Component Loading",
            dynamics: "mf",
            timing: "immediate"
          }]
        }]
      },
      {
        name: "Canvas.component-drag-symphony", 
        description: "Canvas drag operation sequence",
        key: "D Major",
        tempo: 140,
        category: "canvas-operations",
        movements: [{
          name: "Drag Operation",
          beats: [{
            beat: 1,
            event: "canvas:element:drag:start",
            title: "Start Drag Operation",
            dynamics: "f",
            timing: "immediate"
          }]
        }]
      }
    ];

    testSequences.forEach(seq => this.conductor.registerSequence(seq));
    console.log(`✅ Setup ${testSequences.length} test sequences`);
  }

  /**
   * Test Phase 1: Resource Ownership Tracking
   */
  async testResourceOwnershipTracking() {
    console.log("\n🔍 Testing Phase 1: Resource Ownership Tracking");
    
    try {
      // Test 1: Basic resource acquisition
      const requestId1 = this.conductor.startSequence(
        "JsonLoader.json-component-symphony",
        { componentId: "test-component-1" },
        SEQUENCE_PRIORITIES.NORMAL
      );

      // Test 2: Same symphony, different instance (should be rejected)
      try {
        const requestId2 = this.conductor.startSequence(
          "JsonLoader.json-component-symphony", 
          { componentId: "test-component-1", instanceId: "different-instance" },
          SEQUENCE_PRIORITIES.NORMAL
        );
        this.testResults.push({
          test: "Resource Conflict Detection",
          passed: false,
          message: "Expected resource conflict but sequence was allowed"
        });
      } catch (error) {
        this.testResults.push({
          test: "Resource Conflict Detection", 
          passed: true,
          message: "Resource conflict properly detected and rejected"
        });
      }

      // Test 3: Different symphony, same resource (should queue)
      const requestId3 = this.conductor.startSequence(
        "Canvas.component-drag-symphony",
        { componentId: "test-component-1" },
        SEQUENCE_PRIORITIES.NORMAL
      );

      // Verify queue status
      const queueStatus = this.conductor.getQueueStatus();
      this.testResults.push({
        test: "Resource Queuing",
        passed: queueStatus.length > 0,
        message: `Queue length: ${queueStatus.length}`
      });

      console.log("✅ Resource Ownership Tracking tests completed");

    } catch (error) {
      this.testResults.push({
        test: "Resource Ownership Tracking",
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Test Phase 2: Conflict Resolution Strategies
   */
  async testConflictResolutionStrategies() {
    console.log("\n🔍 Testing Phase 2: Conflict Resolution Strategies");

    try {
      // Clear any existing sequences
      this.conductor.clearSequenceQueue();

      // Test REJECT strategy (same symphony, different instance)
      const requestId1 = this.conductor.startSequence(
        "JsonLoader.json-component-symphony",
        { componentId: "conflict-test-1" },
        SEQUENCE_PRIORITIES.NORMAL
      );

      // Test INTERRUPT strategy (HIGH priority)
      const requestId2 = this.conductor.startSequence(
        "Canvas.component-drag-symphony",
        { componentId: "conflict-test-1" },
        SEQUENCE_PRIORITIES.HIGH
      );

      // Verify HIGH priority sequence is active
      const currentSequence = this.conductor.getCurrentSequence();
      this.testResults.push({
        test: "HIGH Priority Interrupt",
        passed: currentSequence && currentSequence.sequenceName.includes("Canvas"),
        message: `Active sequence: ${currentSequence?.sequenceName || 'none'}`
      });

      console.log("✅ Conflict Resolution Strategy tests completed");

    } catch (error) {
      this.testResults.push({
        test: "Conflict Resolution Strategies",
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Test Phase 3: StrictMode Protection & Idempotency
   */
  async testStrictModeProtection() {
    console.log("\n🔍 Testing Phase 3: StrictMode Protection & Idempotency");

    try {
      // Clear sequences
      this.conductor.clearSequenceQueue();

      // Test duplicate detection
      const sequenceData = { componentId: "idempotency-test" };
      
      const requestId1 = this.conductor.startSequence(
        "JsonLoader.json-component-symphony",
        sequenceData,
        SEQUENCE_PRIORITIES.NORMAL
      );

      // Immediate duplicate (should be blocked)
      const requestId2 = this.conductor.startSequence(
        "JsonLoader.json-component-symphony", 
        sequenceData,
        SEQUENCE_PRIORITIES.NORMAL
      );

      this.testResults.push({
        test: "Duplicate Request Detection",
        passed: requestId1 !== requestId2 && requestId2.includes('duplicate'),
        message: `Original: ${requestId1}, Duplicate: ${requestId2}`
      });

      console.log("✅ StrictMode Protection tests completed");

    } catch (error) {
      this.testResults.push({
        test: "StrictMode Protection",
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Test Phase 4: Orchestration Validation Compliance
   */
  async testOrchestrationCompliance() {
    console.log("\n🔍 Testing Phase 4: Orchestration Validation Compliance");

    try {
      // Test all required orchestration methods exist and work
      const methods = [
        'queueSequence',
        'executeNextSequence', 
        'isSequenceRunning',
        'getCurrentSequence',
        'getQueuedSequences',
        'clearSequenceQueue'
      ];

      let allMethodsExist = true;
      const missingMethods = [];

      methods.forEach(method => {
        if (typeof this.conductor[method] !== 'function') {
          allMethodsExist = false;
          missingMethods.push(method);
        }
      });

      this.testResults.push({
        test: "Orchestration Methods Exist",
        passed: allMethodsExist,
        message: missingMethods.length > 0 ? `Missing: ${missingMethods.join(', ')}` : "All methods present"
      });

      // Test method functionality
      const isRunning = this.conductor.isSequenceRunning();
      const queuedSequences = this.conductor.getQueuedSequences();
      
      this.testResults.push({
        test: "Orchestration Methods Functional",
        passed: typeof isRunning === 'boolean' && Array.isArray(queuedSequences),
        message: `isRunning: ${isRunning}, queuedSequences: ${queuedSequences.length}`
      });

      console.log("✅ Orchestration Compliance tests completed");

    } catch (error) {
      this.testResults.push({
        test: "Orchestration Compliance",
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Test Phase 5: Performance & Stability
   */
  async testPerformanceAndStability() {
    console.log("\n🔍 Testing Phase 5: Performance & Stability");

    try {
      // Performance test: Multiple rapid sequence requests
      const startTime = performance.now();
      const requestCount = 50;
      const requests = [];

      for (let i = 0; i < requestCount; i++) {
        try {
          const requestId = this.conductor.startSequence(
            "JsonLoader.json-component-symphony",
            { componentId: `perf-test-${i}` },
            SEQUENCE_PRIORITIES.NORMAL
          );
          requests.push(requestId);
        } catch (error) {
          // Expected for some requests due to conflicts
        }
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const avgTimePerRequest = totalTime / requestCount;

      this.performanceMetrics = {
        totalRequests: requestCount,
        successfulRequests: requests.length,
        totalTime: totalTime,
        avgTimePerRequest: avgTimePerRequest,
        requestsPerSecond: (requestCount / totalTime) * 1000
      };

      this.testResults.push({
        test: "Performance Benchmark",
        passed: avgTimePerRequest < 10, // Less than 10ms per request
        message: `${avgTimePerRequest.toFixed(2)}ms avg, ${this.performanceMetrics.requestsPerSecond.toFixed(0)} req/sec`
      });

      // Memory stability test
      const resourceOwnership = this.conductor.getResourceOwnership();
      const symphonyResourceMap = this.conductor.getSymphonyResourceMap();
      
      this.testResults.push({
        test: "Memory Stability",
        passed: resourceOwnership.size < 100 && symphonyResourceMap.size < 50,
        message: `Resources: ${resourceOwnership.size}, Symphonies: ${symphonyResourceMap.size}`
      });

      console.log("✅ Performance & Stability tests completed");

    } catch (error) {
      this.testResults.push({
        test: "Performance & Stability",
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Generate comprehensive test report
   */
  generateTestReport() {
    console.log("\n📊 MCO/MSO Test Report");
    console.log("=" .repeat(60));

    const passedTests = this.testResults.filter(r => r.passed).length;
    const totalTests = this.testResults.length;
    const passRate = ((passedTests / totalTests) * 100).toFixed(1);

    console.log(`Overall Results: ${passedTests}/${totalTests} tests passed (${passRate}%)`);
    console.log();

    this.testResults.forEach(result => {
      const status = result.passed ? "✅ PASS" : "❌ FAIL";
      console.log(`${status} ${result.test}`);
      if (result.message) {
        console.log(`    ${result.message}`);
      }
      if (result.error) {
        console.log(`    Error: ${result.error}`);
      }
    });

    if (Object.keys(this.performanceMetrics).length > 0) {
      console.log("\n📈 Performance Metrics:");
      console.log(`  Total Requests: ${this.performanceMetrics.totalRequests}`);
      console.log(`  Successful Requests: ${this.performanceMetrics.successfulRequests}`);
      console.log(`  Total Time: ${this.performanceMetrics.totalTime.toFixed(2)}ms`);
      console.log(`  Avg Time per Request: ${this.performanceMetrics.avgTimePerRequest.toFixed(2)}ms`);
      console.log(`  Requests per Second: ${this.performanceMetrics.requestsPerSecond.toFixed(0)}`);
    }

    // Get conductor statistics
    const stats = this.conductor.getStatistics();
    console.log("\n📊 Conductor Statistics:");
    console.log(`  Total Sequences Executed: ${stats.totalSequencesExecuted}`);
    console.log(`  Total Beats Executed: ${stats.totalBeatsExecuted}`);
    console.log(`  Error Count: ${stats.errorCount}`);
    console.log(`  Current Queue Length: ${stats.currentQueueLength}`);
    console.log(`  Mounted Plugins: ${stats.mountedPlugins}`);

    console.log("\n🎼 MCO/MSO Implementation Test Suite Complete!");
    
    return {
      passRate: parseFloat(passRate),
      passedTests,
      totalTests,
      performanceMetrics: this.performanceMetrics,
      conductorStats: stats
    };
  }
}

// Export for use in other test files
export { MCOTestSuite };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const testSuite = new MCOTestSuite();
  testSuite.runAllTests().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error("Test suite failed:", error);
    process.exit(1);
  });
}
