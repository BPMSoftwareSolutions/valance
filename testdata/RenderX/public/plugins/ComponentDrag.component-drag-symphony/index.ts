/**
 * Canvas Component Drag Symphony No. 4 Plugin
 * Entry Point and Exports
 * 
 * 🎼 Musical Definition:
 * - Name: Canvas Component Drag Symphony No. 4
 * - Key: D Major (Strong and dynamic)
 * - Tempo: 140 BPM (Allegro)
 * - Time Signature: 4/4
 * - Feel: Dynamic element dragging with real-time position updates
 */

// Core sequence and flow
export { CANVAS_COMPONENT_DRAG_SEQUENCE, startCanvasComponentDragFlow } from './sequence';

// Individual handlers
export { default as handleCanvasDragOver } from './handlers/onDragStart';
export { default as handleCanvasElementMoved } from './handlers/onDragging';
export { default as handleCanvasDropValidation, handleCanvasElementCSSSync } from './handlers/onDrop';

// Business logic
export { validateDragContext, canElementBeDragged, validateDragBoundaries } from './logic/dragValidation';
export { processElementDrag, calculateElementBounds, checkElementCollisions } from './logic/dragProcessing';
export { coordinateDragState, syncDragChanges, generateTransform, applyDragFeedback } from './logic/dragCoordination';

// React hooks
export { useCanvasComponentDrag, default as useCanvasComponentDragDefault } from './hooks';

// Plugin metadata
export const PLUGIN_INFO = {
  id: "ComponentDrag.component-drag-symphony",
  name: "Canvas Component Drag Symphony No. 4",
  version: "1.0.0",
  description: "Dynamic Movement - Dynamic drag operation flow for canvas components",
  category: "canvas-operations",
  type: "symphony-plugin",
  musical: {
    key: "D Major",
    tempo: 140,
    timeSignature: "4/4",
    feel: "Dynamic element dragging with real-time position updates"
  }
};

// CIA Plugin Interface
export const CIAPlugin = {
  mount: (conductor: any, eventBus: any) => {
    console.log('🎼 ComponentDrag Plugin: Mounting...');
    
    try {
      // Register the sequence
      conductor.registerSequence(CANVAS_COMPONENT_DRAG_SEQUENCE);
      
      // Register handlers with event bus
      eventBus.subscribe('canvas:element:drag:start', handleCanvasDragOver);
      eventBus.subscribe('canvas:element:drag:move', handleCanvasElementMoved);
      eventBus.subscribe('canvas:element:drag:end', handleCanvasDropValidation);
      eventBus.subscribe('canvas:element:css:sync', handleCanvasElementCSSSync);
      
      console.log('✅ ComponentDrag Plugin: Mounted successfully');
      return true;
    } catch (error) {
      console.error('🚨 ComponentDrag Plugin: Mount failed:', error);
      return false;
    }
  },
  
  unmount: (conductor: any, eventBus: any) => {
    console.log('🎼 ComponentDrag Plugin: Unmounting...');
    
    try {
      // Unsubscribe from events
      eventBus.unsubscribe('canvas:element:drag:start', handleCanvasDragOver);
      eventBus.unsubscribe('canvas:element:drag:move', handleCanvasElementMoved);
      eventBus.unsubscribe('canvas:element:drag:end', handleCanvasDropValidation);
      eventBus.unsubscribe('canvas:element:css:sync', handleCanvasElementCSSSync);
      
      console.log('✅ ComponentDrag Plugin: Unmounted successfully');
      return true;
    } catch (error) {
      console.error('🚨 ComponentDrag Plugin: Unmount failed:', error);
      return false;
    }
  }
};

export default CIAPlugin;
