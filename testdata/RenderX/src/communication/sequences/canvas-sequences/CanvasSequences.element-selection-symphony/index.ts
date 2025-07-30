/**
 * Canvas Element Selection Symphony - Unified Export
 * 
 * 🎼 Complete symphony implementation with all components:
 * - Sequence definition
 * - React hook implementation
 * - Event handlers
 * - Handler registration
 * - Business logic
 * 
 * @version 1.0.0
 * @author RenderX Evolution Team
 * @date 2025-07-29
 */

// Core symphony components
export { CANVAS_ELEMENT_SELECTION_SEQUENCE, startCanvasElementSelectionFlow } from './sequence';
export { useCanvasElementSelectionSymphony } from './hooks';
export { CANVAS_ELEMENT_SELECTION_HANDLERS } from './handlers';
export { 
  registerCanvasElementSelectionHandlers,
  CANVAS_ELEMENT_SELECTION_REGISTRY_METADATA 
} from './registry';
export * from './business-logic';

// Symphony metadata
export const SYMPHONY_METADATA = {
  name: "Canvas Element Selection Symphony No. 37",
  description: "Selection Harmony - Complete element selection implementation",
  version: "1.0.0",
  completionStatus: "COMPLETE",
  files: {
    sequence: "sequence.ts",
    hooks: "hooks.ts",
    handlers: "handlers.ts",
    registry: "registry.ts",
    businessLogic: "business-logic.ts",
    index: "index.ts"
  },
  capabilities: [
    "Element selection detection",
    "Selection processing",
    "Visual tools coordination",
    "Selection state management",
    "Multi-select support",
    "React hook integration",
    "Event handler registration",
    "Business logic utilities"
  ],
  dependencies: [
    "SequenceTypes",
    "EVENT_TYPES",
    "React hooks"
  ]
};
