export const operator = "validateMusicalConductorSequenceOrchestration";

export async function evaluate(content, rule, context) {
  try {
    const filePath = context.filePath;
    const errors = [];
    const warnings = [];

    // Check if this is a MusicalConductor file
    if (!filePath.includes('MusicalConductor')) {
      return {
        passed: true,
        message: "Not a MusicalConductor file, skipping MCO/MSO validation"
      };
    }

    // Check sequential orchestration (MCO)
    if (rule.checkSequentialOrchestration) {
      const mcoValidation = validateSequentialOrchestration(content, rule);
      if (!mcoValidation.passed) {
        errors.push(mcoValidation.message);
      }
      if (mcoValidation.warnings) {
        warnings.push(...mcoValidation.warnings);
      }
    }

    // Validate resource management (MSO)
    if (rule.validateResourceManagement) {
      const msoValidation = validateResourceManagement(content, rule);
      if (!msoValidation.passed) {
        warnings.push(msoValidation.message);
      }
    }

    // Check beat execution patterns
    if (rule.checkBeatExecution) {
      const beatValidation = validateBeatExecution(content, rule);
      if (!beatValidation.passed) {
        errors.push(beatValidation.message);
      }
    }

    // Validate idempotency protection
    if (rule.validateIdempotencyProtection) {
      const idempotencyValidation = validateIdempotencyProtection(content, rule);
      if (!idempotencyValidation.passed) {
        warnings.push(idempotencyValidation.message);
      }
    }

    // Check event listener management
    if (rule.checkEventListenerManagement) {
      const listenerValidation = validateEventListenerManagement(content, rule);
      if (!listenerValidation.passed) {
        warnings.push(listenerValidation.message);
      }
    }

    // Enforce queue-based system
    if (rule.enforceQueueBasedSystem) {
      const queueValidation = validateQueueBasedSystem(content, rule);
      if (!queueValidation.passed) {
        errors.push(queueValidation.message);
      }
    }

    if (errors.length > 0) {
      return {
        passed: false,
        message: `MCO/MSO validation failed: ${errors.join('; ')}`
      };
    }

    return {
      passed: true,
      message: "MCO/MSO validation passed - Musical Conductor implements proper orchestration",
      warnings: warnings.length > 0 ? warnings : undefined
    };

  } catch (error) {
    return {
      passed: false,
      message: `MCO/MSO validation error: ${error.message}`
    };
  }
}

function validateSequentialOrchestration(content, rule) {
  const mcoPatterns = rule.mcoPatterns?.sequentialOrchestration || [
    "activeSequence.*SequenceExecutionContext",
    "sequenceQueue.*SequenceRequest",
    "sequenceHistory.*SequenceExecutionContext"
  ];

  const warnings = [];
  let foundPatterns = 0;

  for (const pattern of mcoPatterns) {
    const regex = new RegExp(pattern, 'gi');
    if (regex.test(content)) {
      foundPatterns++;
      warnings.push(`Found MCO pattern: ${pattern}`);
    }
  }

  if (foundPatterns === 0) {
    return {
      passed: false,
      message: "No MCO sequential orchestration patterns found"
    };
  }

  return {
    passed: true,
    message: `Found ${foundPatterns} MCO sequential orchestration patterns`,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

function validateResourceManagement(content, rule) {
  const msoPatterns = rule.msoPatterns?.resourceManagement || [
    "resourceOwnership",
    "conflictResolution",
    "resource.*tracking"
  ];

  let foundPatterns = 0;

  for (const pattern of msoPatterns) {
    const regex = new RegExp(pattern, 'gi');
    if (regex.test(content)) {
      foundPatterns++;
    }
  }

  if (foundPatterns === 0) {
    return {
      passed: false,
      message: "No MSO resource management patterns found"
    };
  }

  return {
    passed: true,
    message: `Found ${foundPatterns} MSO resource management patterns`
  };
}

function validateBeatExecution(content, rule) {
  const beatPatterns = rule.mcoPatterns?.beatExecution || [
    "executeBeat\\s*\\(",
    "beat.*execution",
    "sequential.*beat"
  ];

  let foundPatterns = 0;

  for (const pattern of beatPatterns) {
    const regex = new RegExp(pattern, 'gi');
    if (regex.test(content)) {
      foundPatterns++;
    }
  }

  if (foundPatterns === 0) {
    return {
      passed: false,
      message: "No beat execution patterns found - missing MCO beat-level orchestration"
    };
  }

  return {
    passed: true,
    message: `Found ${foundPatterns} beat execution patterns`
  };
}

function validateIdempotencyProtection(content, rule) {
  const idempotencyPatterns = rule.msoPatterns?.idempotencyProtection || [
    "duplicate.*detection",
    "sequence.*hash",
    "idempotent.*execution"
  ];

  let foundPatterns = 0;

  for (const pattern of idempotencyPatterns) {
    const regex = new RegExp(pattern, 'gi');
    if (regex.test(content)) {
      foundPatterns++;
    }
  }

  if (foundPatterns === 0) {
    return {
      passed: false,
      message: "No idempotency protection found - may have React StrictMode issues"
    };
  }

  return {
    passed: true,
    message: `Found ${foundPatterns} idempotency protection patterns`
  };
}

function validateEventListenerManagement(content, rule) {
  const listenerPatterns = rule.msoPatterns?.eventListenerManagement || [
    "addEventListener",
    "removeEventListener",
    "cleanup.*listeners"
  ];

  let foundPatterns = 0;

  for (const pattern of listenerPatterns) {
    const regex = new RegExp(pattern, 'gi');
    if (regex.test(content)) {
      foundPatterns++;
    }
  }

  if (foundPatterns === 0) {
    return {
      passed: false,
      message: "No event listener management found - potential memory leaks"
    };
  }

  return {
    passed: true,
    message: `Found ${foundPatterns} event listener management patterns`
  };
}

function validateQueueBasedSystem(content, rule) {
  const queuePatterns = rule.mcoPatterns?.queueManagement || [
    "sequenceQueue\\.push",
    "sequenceQueue\\.shift",
    "processQueue"
  ];

  let foundPatterns = 0;

  for (const pattern of queuePatterns) {
    const regex = new RegExp(pattern, 'gi');
    if (regex.test(content)) {
      foundPatterns++;
    }
  }

  if (foundPatterns === 0) {
    return {
      passed: false,
      message: "No queue-based system found - missing MCO queue management"
    };
  }

  return {
    passed: true,
    message: `Found ${foundPatterns} queue management patterns`
  };
}
