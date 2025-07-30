/**
 * Test file for Data Contract Validation
 * Contains data contract violations between convenience functions and handlers
 */

// ❌ MISSING_DATA_PROPERTY - convenience function doesn't provide required data
export function startCanvasElementSelection(element) {
  return conductorEventBus.startSequence('canvas-element-selection', {
    elementId: element.id,
    // ❌ Missing 'position' property that handler expects
    // ❌ Missing 'dimensions' property that handler expects
    timestamp: Date.now()
  });
}

// ❌ Handler expects more data than convenience function provides
export function handleCanvasElementSelection(data) {
  console.log('Element ID:', data.elementId); // ✅ Available
  console.log('Position:', data.position);    // ❌ Missing - will be undefined
  console.log('Dimensions:', data.dimensions); // ❌ Missing - will be undefined
  console.log('Timestamp:', data.timestamp);  // ✅ Available
}

// ❌ MISSING_DATA_PROPERTY - another example
export function startCanvasDrag(startPoint) {
  return conductorEventBus.startSequence('canvas-drag-start', {
    x: startPoint.x,
    y: startPoint.y
    // ❌ Missing 'elementId' that handler expects
    // ❌ Missing 'dragType' that handler expects
  });
}

export function handleCanvasDragStart(data) {
  console.log('Start position:', data.x, data.y); // ✅ Available
  console.log('Element ID:', data.elementId);     // ❌ Missing
  console.log('Drag type:', data.dragType);       // ❌ Missing
}

// ❌ MISSING_CONVENIENCE_FUNCTION - handler expects data but no convenience function provides it
export function handleCanvasResize(data) {
  // ❌ This handler expects data but there's no startCanvasResize convenience function
  console.log('New width:', data.width);   // ❌ No convenience function provides this
  console.log('New height:', data.height); // ❌ No convenience function provides this
  console.log('Element:', data.element);   // ❌ No convenience function provides this
}

// ❌ Another handler without convenience function
export function handleButtonStateChange(eventData) {
  console.log('Button ID:', eventData.buttonId);    // ❌ Missing convenience function
  console.log('New state:', eventData.newState);    // ❌ Missing convenience function
  console.log('Previous state:', eventData.oldState); // ❌ Missing convenience function
}

// ✅ Valid data contract - convenience function provides all required data
export function startContainerExpansion(container, newSize) {
  return conductorEventBus.startSequence('container-expansion', {
    containerId: container.id,
    newWidth: newSize.width,
    newHeight: newSize.height,
    animationDuration: 300
  });
}

export function handleContainerExpansion(data) {
  console.log('Container ID:', data.containerId);      // ✅ Available
  console.log('New dimensions:', data.newWidth, data.newHeight); // ✅ Available
  console.log('Animation duration:', data.animationDuration);    // ✅ Available
}

// ✅ Valid - convenience function provides extra data (no violation)
export function startElementCreation(elementType, position, properties) {
  return conductorEventBus.startSequence('element-creation', {
    type: elementType,
    x: position.x,
    y: position.y,
    width: properties.width,
    height: properties.height,
    color: properties.color,
    // ✅ Extra properties are fine
    metadata: properties.metadata,
    createdBy: 'user',
    version: '1.0'
  });
}

export function handleElementCreation(data) {
  console.log('Element type:', data.type);     // ✅ Available
  console.log('Position:', data.x, data.y);    // ✅ Available
  console.log('Size:', data.width, data.height); // ✅ Available
  console.log('Color:', data.color);           // ✅ Available
  // Handler doesn't use extra properties - that's fine
}

// ❌ Complex data contract violation
export function startComplexWorkflow(workflowData) {
  return conductorEventBus.startSequence('complex-workflow', {
    workflowId: workflowData.id,
    steps: workflowData.steps,
    // ❌ Missing nested properties that handler expects
    config: {
      timeout: 5000
      // ❌ Missing config.retries
      // ❌ Missing config.errorHandling
    }
  });
}

export function handleComplexWorkflow(data) {
  console.log('Workflow ID:', data.workflowId);        // ✅ Available
  console.log('Steps:', data.steps);                   // ✅ Available
  console.log('Timeout:', data.config.timeout);        // ✅ Available
  console.log('Retries:', data.config.retries);        // ❌ Missing
  console.log('Error handling:', data.config.errorHandling); // ❌ Missing
}

// ❌ Handler with destructuring - should detect required properties
export function handleAdvancedEvent({ elementId, position, metadata, settings }) {
  console.log('Element:', elementId);
  console.log('Position:', position);
  console.log('Metadata:', metadata);
  console.log('Settings:', settings);
}

// No corresponding convenience function for handleAdvancedEvent - should trigger MISSING_CONVENIENCE_FUNCTION
