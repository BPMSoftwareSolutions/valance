/**
 * Simple test for cross-component events
 */

// Simple event definition that should be detected
const sequence = {
  beats: [
    {
      event: 'canvas-element-highlighted', // ❌ Not in button/container/element event types
      handler: () => {}
    },
    {
      event: 'canvas-interaction-complete', // ❌ Not in button/container/element event types
      handler: () => {}
    }
  ]
};
