export const operator = "validateMusicalConductorOrchestration";

export async function evaluate(content, rule, context) {
  try {
    const filePath = context.filePath;

    // Check if this is a MusicalConductor file
    if (!filePath.includes('MusicalConductor')) {
      return {
        passed: true,
        message: "Not a MusicalConductor file, skipping orchestration validation"
      };
    }

    const errors = [];
    const warnings = [];
    const suggestions = [];

    // Check for required sequence orchestration methods
    const requiredMethods = [
      'queueSequence',
      'executeNextSequence', 
      'isSequenceRunning',
      'getCurrentSequence',
      'getQueuedSequences'
    ];

    const missingMethods = [];
    for (const method of requiredMethods) {
      const methodPattern = new RegExp(`(${method}|${method}\\s*\\(|${method}\\s*:)`, 'i');
      if (!methodPattern.test(content)) {
        missingMethods.push(method);
      }
    }

    if (missingMethods.length > 0) {
      errors.push(
        `CRITICAL: Missing sequence orchestration methods: ${missingMethods.join(', ')}`
      );
      suggestions.push(
        "Implement sequence queuing methods to handle concurrent sequence requests"
      );
    }

    // Check for sequence queue data structure
    const queuePatterns = [
      /sequenceQueue/i,
      /queue.*sequence/i,
      /pending.*sequence/i,
      /Array.*sequence/i
    ];

    const hasQueueStructure = queuePatterns.some(pattern => pattern.test(content));
    if (!hasQueueStructure) {
      errors.push(
        "CRITICAL: No sequence queue data structure found"
      );
      suggestions.push(
        "Add sequenceQueue property to store pending sequences"
      );
    }

    // Check for concurrency control
    const concurrencyPatterns = [
      /isExecuting/i,
      /currentSequence/i,
      /running.*sequence/i,
      /executing.*sequence/i,
      /busy|locked|mutex/i
    ];

    const hasConcurrencyControl = concurrencyPatterns.some(pattern => pattern.test(content));
    if (!hasConcurrencyControl) {
      errors.push(
        "CRITICAL: No concurrency control mechanism found"
      );
      suggestions.push(
        "Add isExecuting flag or similar mechanism to track sequence execution state"
      );
    }

    // Check for deferred execution patterns
    const deferredPatterns = [
      /if.*isExecuting.*return/i,
      /if.*running.*queue/i,
      /defer.*until/i,
      /wait.*complete/i,
      /queue.*push.*sequence/i
    ];

    const hasDeferredExecution = deferredPatterns.some(pattern => pattern.test(content));
    if (!hasDeferredExecution) {
      errors.push(
        "CRITICAL: No deferred execution pattern found for concurrent requests"
      );
      suggestions.push(
        "Implement logic to queue sequences when another is already executing"
      );
    }

    // Check for anti-patterns (simultaneous execution)
    const antiPatterns = [
      /Promise\.all.*sequence/i,
      /parallel.*sequence/i,
      /concurrent.*sequence/i,
      /simultaneous.*sequence/i
    ];

    const hasAntiPatterns = antiPatterns.some(pattern => pattern.test(content));
    if (hasAntiPatterns) {
      errors.push(
        "CRITICAL: Anti-pattern detected - simultaneous sequence execution"
      );
      suggestions.push(
        "Remove parallel sequence execution - sequences must run sequentially"
      );
    }

    // Check for queue processing logic
    const queueProcessingPatterns = [
      /while.*queue.*length/i,
      /for.*queue/i,
      /executeNext/i,
      /processQueue/i,
      /shift.*queue|dequeue/i
    ];

    const hasQueueProcessing = queueProcessingPatterns.some(pattern => pattern.test(content));
    if (!hasQueueProcessing) {
      warnings.push(
        "Missing automatic queue processing logic"
      );
      suggestions.push(
        "Add automatic queue processing to execute pending sequences"
      );
    }

    // Check for sequence completion handling
    const completionPatterns = [
      /onSequenceComplete/i,
      /sequence.*complete/i,
      /finally.*sequence/i,
      /cleanup.*sequence/i
    ];

    const hasCompletionHandling = completionPatterns.some(pattern => pattern.test(content));
    if (!hasCompletionHandling) {
      warnings.push(
        "Missing sequence completion handling"
      );
      suggestions.push(
        "Add sequence completion handlers to trigger queue processing"
      );
    }

    // Determine orchestration compliance level
    let orchestrationLevel = "none";
    if (missingMethods.length === 0 && hasQueueStructure && hasConcurrencyControl) {
      if (hasDeferredExecution && hasQueueProcessing) {
        orchestrationLevel = "full";
      } else {
        orchestrationLevel = "partial";
      }
    } else if (hasQueueStructure || hasConcurrencyControl) {
      orchestrationLevel = "minimal";
    }

    const result = {
      passed: errors.length === 0,
      confidence: errors.length === 0 ? 0.95 : 0.7,
      message: errors.length === 0
        ? `MusicalConductor sequence orchestration validation passed (${orchestrationLevel} compliance)`
        : `MusicalConductor sequence orchestration failed: ${errors.join('; ')}`
    };

    if (warnings.length > 0) {
      result.warnings = warnings;
    }

    if (suggestions.length > 0) {
      result.suggestions = suggestions;
    }

    // Add detailed metadata
    result.metadata = {
      filePath: filePath,
      orchestrationLevel: orchestrationLevel,
      hasQueueStructure: hasQueueStructure,
      hasConcurrencyControl: hasConcurrencyControl,
      hasDeferredExecution: hasDeferredExecution,
      hasQueueProcessing: hasQueueProcessing,
      hasCompletionHandling: hasCompletionHandling,
      missingMethods: missingMethods,
      hasAntiPatterns: hasAntiPatterns,
      architecturalCompliance: errors.length === 0
    };

    return result;

  } catch (error) {
    return {
      passed: false,
      confidence: 0.5,
      message: `MusicalConductor orchestration validation error: ${error.message}`
    };
  }
}
