/**
 * Test file for Cross Component Event Validation
 * Contains cross-component event violations and valid patterns
 */

// ❌ Cross-component events that should be registered in other components
export const CanvasElementSequence = {
  name: 'Canvas Element Selection Symphony No. 1',
  description: 'Orchestrates element selection with cross-component coordination',
  key: 'C Major',
  tempo: 120,
  movements: [
    {
      name: 'Element Selection',
      beats: [
        {
          number: 1,
          // ❌ MISSING_CROSS_COMPONENT_EVENT - should be in button.event-types.ts
          event: 'canvas-element-selected',
          handler: (data) => {
            console.log('Element selected:', data.elementId);
          }
        },
        {
          number: 2,
          // ❌ MISSING_CROSS_COMPONENT_EVENT - should be in container.event-types.ts  
          event: 'canvas-drag-start',
          handler: (data) => {
            console.log('Drag started:', data.position);
          }
        },
        {
          number: 3,
          // ❌ CROSS_COMPONENT_GAP - canvas event not available in element component
          event: 'canvas-resize-end',
          handler: (data) => {
            console.log('Resize ended:', data.dimensions);
          }
        }
      ]
    }
  ]
};

// ❌ More cross-component events
export const CanvasInteractionSequence = {
  name: 'Canvas Interaction Symphony No. 2',
  movements: [
    {
      beats: [
        {
          // ❌ Should be accessible in button component
          event: 'canvas-element-hover',
          handler: handleElementHover
        },
        {
          // ❌ Should be accessible in container component
          event: 'canvas-bounds-update',
          handler: handleBoundsUpdate
        }
      ]
    }
  ]
};

// ✅ Canvas-internal events that should NOT be cross-component
export const CanvasInternalSequence = {
  name: 'Canvas Internal Operations',
  movements: [
    {
      beats: [
        {
          // ✅ Valid - canvas-internal event
          event: 'canvas-css-sync-detected',
          handler: handleCssSync
        },
        {
          // ✅ Valid - canvas-internal event
          event: 'canvas-render-start',
          handler: handleRenderStart
        },
        {
          // ✅ Valid - canvas-internal event
          event: 'canvas-performance-warning',
          handler: handlePerformanceWarning
        },
        {
          // ✅ Valid - canvas-internal event
          event: 'canvas-tool-selected',
          handler: handleToolSelection
        }
      ]
    }
  ]
};

// ✅ Valid button component events (no cross-component issues)
export const ButtonSequence = {
  name: 'Button Interaction Symphony',
  movements: [
    {
      beats: [
        {
          // ✅ Valid - button-specific event
          event: 'button-clicked',
          handler: handleButtonClick
        },
        {
          // ✅ Valid - button-specific event
          event: 'button-hover',
          handler: handleButtonHover
        }
      ]
    }
  ]
};

// Event handlers
function handleElementHover(data) {
  console.log('Element hover:', data);
}

function handleBoundsUpdate(data) {
  console.log('Bounds update:', data);
}

function handleCssSync(data) {
  console.log('CSS sync detected:', data);
}

function handleRenderStart(data) {
  console.log('Render started:', data);
}

function handlePerformanceWarning(data) {
  console.log('Performance warning:', data);
}

function handleToolSelection(data) {
  console.log('Tool selected:', data);
}

function handleButtonClick(data) {
  console.log('Button clicked:', data);
}

function handleButtonHover(data) {
  console.log('Button hover:', data);
}
