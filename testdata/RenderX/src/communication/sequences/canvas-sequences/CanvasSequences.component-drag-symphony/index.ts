/**
 * Canvas Component Drag Symphony - Unified Export
 *
 * 🎼 Complete symphony implementation with all components:
 * - Sequence definition
 * - TypeScript hook implementation (requires conductor parameter)
 * - Event handlers
 * - Handler registration
 * - Business logic
 *
 * Usage:
 * ```typescript
 * const { updateElementState } = useCanvasComponentDragSymphony(
 *   conductor, elements, setElements, syncElementCSS
 * );
 * ```
 */

// Core symphony components
export { CANVAS_COMPONENT_DRAG_SEQUENCE, startCanvasComponentDragFlow } from './sequence';
export { useCanvasComponentDragSymphony } from './hooks';
export { CANVAS_COMPONENT_DRAG_HANDLERS } from './handlers';
export { registerCanvasComponentDragHandlers } from './registry';
export * from './business-logic';

// Symphony metadata
export const SYMPHONY_METADATA = {
    name: "Canvas Component Drag Symphony No. 4",
    description: "Dynamic Movement - Complete component drag implementation",
    version: "1.0.0",
    completionStatus: "COMPLETE",
    files: {
        sequence: "sequence.ts",
        hooks: "hooks.ts",
        handlers: "handlers.ts",
        registry: "registry.ts",
        businessLogic: "business-logic.ts"
    }
};
