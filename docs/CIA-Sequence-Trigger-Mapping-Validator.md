# 🧠 CIA Sequence Trigger Mapping Validator

## Overview

The **Sequence Trigger Mapping Validator** is a critical component of the **Conductor Integration Architecture (CIA)** that ensures every SPA plugin registered via CIA is actually triggered at runtime using conductor methods.

This validator prevents the common issue where plugins are properly registered but never actually used, leading to dead code and potential runtime errors.

## 🎯 Purpose

**Validates that registered SPA plugins are actually triggered at runtime**

- ✅ **Runtime Coverage** - Ensures plugins registered via CIA are actually used
- ✅ **Trigger Detection** - Finds `conductor.startSequence()` and `conductor.executeMovementHandler()` calls
- ✅ **Convenience Function Validation** - Detects usage of convenience functions like `startCanvasComponentDragFlow()`
- ✅ **Cross-Reference Analysis** - Maps plugin definitions to their runtime triggers
- ✅ **Dead Code Prevention** - Identifies registered but unused plugins

## 🔧 Configuration

### Validator Configuration
```json
{
  "name": "cia-sequence-trigger-mapping",
  "type": "content",
  "filePattern": ".*\\.(tsx|ts|js|jsx)$",
  "confidenceThreshold": 0.9,
  "rules": [
    {
      "plugin": "validateSequenceTriggerMapping",
      "checkSequenceStartCalls": true,
      "checkMovementHandlerCalls": true,
      "checkConvenienceFunctions": true,
      "validateTriggerFiles": ["App.tsx", "Canvas.tsx", "index.tsx"],
      "verbose": true
    }
  ]
}
```

### Trigger File Patterns
The validator looks for triggers in these file types:
- `App.tsx` / `App.ts` - Main application files
- `Canvas.tsx` / `Canvas.ts` - Canvas component files  
- `index.tsx` / `index.ts` - Entry point files
- `hooks.tsx` / `hooks.ts` - React hooks files

### Expected Trigger Methods
- `conductor.startSequence(sequenceName, data)`
- `conductor.executeMovementHandler(sequenceId, movementName, data)`
- Convenience functions: `startCanvasComponentDragFlow()`, `startLayoutModeChangeFlow()`, etc.

## 🚀 Usage

### CLI Usage
```bash
# Validate specific files
node cli/cli.js --validator CIA/sequence-trigger-mapping --files "src/App.tsx"

# Use CIA comprehensive profile (includes this validator)
node cli/cli.js --profile cia-comprehensive --files "src/**/*.tsx"

# Generate detailed reports
node cli/cli.js --validator CIA/sequence-trigger-mapping --files "src/**/*" --generate-reports
```

### Integration with CIA Profile
The validator is automatically included in the `cia-comprehensive` profile:
```json
{
  "name": "cia-comprehensive",
  "validators": [
    "CIA/plugin-interface-runtime",
    "CIA/handler-alignment-runtime", 
    "CIA/mount-call-safety",
    "CIA/plugin-loader-validation",
    "CIA/conductor-test-harness",
    "CIA/sequence-trigger-mapping"
  ]
}
```

## ✅ Valid Patterns

### 1. Direct Conductor Calls
```typescript
// ✅ VALID: conductor.startSequence() call
const handleDragStart = (element: any, dragData: any) => {
  conductor.startSequence('Canvas Component Drag Symphony No. 4', {
    element,
    dragData,
    timestamp: Date.now()
  });
};

// ✅ VALID: conductor.executeMovementHandler() call  
const handleMovement = (sequenceId: string, movement: string, data: any) => {
  conductor.executeMovementHandler(sequenceId, movement, data);
};
```

### 2. Convenience Functions
```typescript
// ✅ VALID: Convenience function usage
const handleCanvasDrag = (element: any, eventData: any) => {
  startCanvasComponentDragFlow(
    conductor,
    element,
    eventData,
    elements,
    setElements,
    syncElementCSS
  );
};
```

### 3. Plugin Registration with Triggers
```typescript
// ✅ VALID: Plugin sequence definition
export const CANVAS_DRAG_SEQUENCE = {
  name: "Canvas Drag Symphony No. 1",
  description: "Canvas drag operations",
  movements: [...]
};

// ✅ VALID: Plugin registration
conductor.registerSequence(CANVAS_DRAG_SEQUENCE);

// ✅ VALID: Corresponding trigger in App.tsx
conductor.startSequence('Canvas Drag Symphony No. 1', data);
```

## ❌ Invalid Patterns

### 1. Missing Triggers
```typescript
// ❌ INVALID: No sequence triggers in App.tsx
const App = () => {
  const handleClick = () => {
    console.log('No sequence triggers here');
    // Missing: conductor.startSequence() call
  };
  
  return <div onClick={handleClick}>No Triggers</div>;
};
```

### 2. Registered but Unused Plugins
```typescript
// ❌ INVALID: Plugin registered but never triggered
const pluginSequence = {
  name: 'Orphaned Plugin Symphony',
  movements: [...]
};

conductor.mount(pluginSequence, handlers); // Registered
// Missing: conductor.startSequence('Orphaned Plugin Symphony', ...)
```

### 3. Wrong Method Names
```typescript
// ❌ INVALID: Incorrect method names
conductor.playSequence(sequenceName, data);     // Should be startSequence
conductor.runMovement(id, movement, data);      // Should be executeMovementHandler
```

## 🔍 Detection Patterns

### Sequence Start Patterns
- `conductor.startSequence('SequenceName', data)`
- `conductor.startSequence("SequenceName", data)`
- `conductor.startSequence(\`SequenceName\`, data)`

### Movement Handler Patterns  
- `conductor.executeMovementHandler('sequenceId', 'movementName', data)`
- `conductor.executeMovementHandler("sequenceId", "movementName", data)`

### Convenience Function Patterns
- `startCanvasComponentDragFlow(...)`
- `startLayoutModeChangeFlow(...)`
- `startPanelToggleFlow(...)`
- `startJsonComponentLoadingFlow(...)`

### Plugin Definition Patterns
- `export const SEQUENCE_NAME = { name: "...", ... }`
- `const sequenceVariable = { name: "...", ... }`
- `registerSequence(sequenceVariable)`
- `conductor.registerSequence(sequenceVariable)`

## 📊 Validation Results

### Success Output
```
✅ PASS cia-sequence-trigger-mapping - All checks passed

Violations found: 3
  1. Found sequence trigger: conductor.startSequence('Canvas Component Drag Symphony No. 4') (confidence: 95%)
  2. Found movement handler trigger: conductor.executeMovementHandler('test-sequence', 'onDragStart') (confidence: 95%)
  3. Found convenience function trigger: startCanvasComponentDragFlow() (confidence: 90%)
```

### Warning Output
```
✅ PASS cia-sequence-trigger-mapping - All checks passed

Warnings: 1
  1. App.tsx should contain sequence triggers (conductor.startSequence, convenience functions, etc.) (confidence: 85%)
```

## 🎯 Best Practices

### 1. Consistent Trigger Patterns
- Use `conductor.startSequence()` for sequence initiation
- Use `conductor.executeMovementHandler()` for specific movement execution
- Prefer convenience functions for common patterns

### 2. Trigger File Organization
- Place main triggers in `App.tsx` or main component files
- Use hooks for reusable trigger logic
- Document trigger points with comments

### 3. Plugin-Trigger Mapping
- Ensure every registered plugin has corresponding triggers
- Use descriptive sequence names that match plugin IDs
- Maintain consistent naming conventions

## 🔗 Integration

### CI/CD Pipeline
```yaml
- name: CIA Sequence Trigger Validation
  run: |
    node cli/cli.js --profile cia-comprehensive \
      --files "src/**/*.tsx" \
      --generate-reports \
      --confidence-threshold 0.9
```

### Development Workflow
1. **Register Plugin** - Mount SPA plugin via CIA
2. **Add Triggers** - Add `conductor.startSequence()` calls in trigger files
3. **Validate** - Run CIA validation to ensure triggers are detected
4. **Test** - Verify runtime behavior matches expected triggers

## 📈 Benefits

- **🛡️ Runtime Safety** - Prevents registered but unused plugins
- **🔍 Dead Code Detection** - Identifies orphaned plugin registrations  
- **📊 Coverage Analysis** - Shows which plugins are actually triggered
- **🎯 Architectural Compliance** - Enforces proper CIA trigger patterns
- **⚡ Performance** - Helps identify and remove unused code

---

**The Sequence Trigger Mapping Validator ensures that your SPA plugins registered via CIA are actually used at runtime, preventing dead code and maintaining architectural integrity!** 🧠✨
