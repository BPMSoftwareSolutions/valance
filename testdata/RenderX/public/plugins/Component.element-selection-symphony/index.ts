/**
 * Canvas Element Selection Symphony No. 37 Plugin
 * Entry Point and Exports
 */

// Core sequence and flow
export { CANVAS_ELEMENT_SELECTION_SEQUENCE, startCanvasElementSelectionFlow } from './sequence';

// Individual handlers
export { default as handleCanvasElementSelected } from './handlers/onSelectionStart';
export { default as handleCanvasSelectionChanged } from './handlers/onSelectionChange';
export { default as handleCanvasSelectionVisualUpdate, handleCanvasSelectionStateSync } from './handlers/onSelectionEnd';

// Business logic
export { validateSelectionContext, canElementBeSelected, getSelectionConstraints } from './logic/selectionValidation';
export { processElementSelection } from './logic/selectionProcessing';
export { updateSelectionVisuals, syncSelectionState } from './logic/selectionCoordination';

// React hooks
export { useCanvasElementSelection, default as useCanvasElementSelectionDefault } from './hooks';

// Plugin metadata
export const PLUGIN_INFO = {
  id: "ElementSelection.element-selection-symphony",
  name: "Canvas Element Selection Symphony No. 37",
  version: "1.0.0",
  description: "Selection Harmony - Dynamic element selection sequence",
  category: "canvas-operations",
  type: "symphony-plugin"
};

// CIA Plugin Interface
export const CIAPlugin = {
  mount: (conductor: any, eventBus: any) => {
    console.log('🎼 ElementSelection Plugin: Mounting...');
    
    try {
      // Register the sequence
      conductor.registerSequence(CANVAS_ELEMENT_SELECTION_SEQUENCE);
      
      // Register handlers with event bus
      eventBus.subscribe('canvas:element:select', handleCanvasElementSelected);
      eventBus.subscribe('canvas:selection:change', handleCanvasSelectionChanged);
      eventBus.subscribe('canvas:selection:visual', handleCanvasSelectionVisualUpdate);
      eventBus.subscribe('canvas:selection:sync', handleCanvasSelectionStateSync);
      
      console.log('✅ ElementSelection Plugin: Mounted successfully');
      return true;
    } catch (error) {
      console.error('🚨 ElementSelection Plugin: Mount failed:', error);
      return false;
    }
  },
  
  unmount: (conductor: any, eventBus: any) => {
    console.log('🎼 ElementSelection Plugin: Unmounting...');
    
    try {
      // Unsubscribe from events
      eventBus.unsubscribe('canvas:element:select', handleCanvasElementSelected);
      eventBus.unsubscribe('canvas:selection:change', handleCanvasSelectionChanged);
      eventBus.unsubscribe('canvas:selection:visual', handleCanvasSelectionVisualUpdate);
      eventBus.unsubscribe('canvas:selection:sync', handleCanvasSelectionStateSync);
      
      console.log('✅ ElementSelection Plugin: Unmounted successfully');
      return true;
    } catch (error) {
      console.error('🚨 ElementSelection Plugin: Unmount failed:', error);
      return false;
    }
  }
};

export default CIAPlugin;
