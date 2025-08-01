/**
 * Panel Toggle Symphony No. 1 Plugin
 * Entry Point and Exports
 */

// Core sequence and flow
export { PANEL_TOGGLE_SEQUENCE, LAYOUT_MODE_CHANGE_SEQUENCE, startPanelToggleFlow, startLayoutModeChangeFlow } from './sequence';

// Individual handlers
export { default as handlePanelToggled } from './handlers/onPanelToggle';
export { default as handleLayoutChanged } from './handlers/onLayoutChange';
export { default as handlePanelAnimationStart, handlePanelAnimationComplete } from './handlers/onAnimationComplete';

// Business logic
export { validatePanelToggle, processPanelToggle } from './logic';

// React hooks
export { usePanelToggle, default as usePanelToggleDefault } from './hooks';

// Plugin metadata
export const PLUGIN_INFO = {
  id: "PanelToggle.panel-toggle-symphony",
  name: "Panel Toggle Symphony No. 1",
  version: "1.0.0",
  description: "Layout Control - Dynamic panel visibility and layout management",
  category: "layout-operations",
  type: "symphony-plugin"
};

// CIA Plugin Interface
export const CIAPlugin = {
  mount: (conductor: any, eventBus: any) => {
    console.log('🎼 PanelToggle Plugin: Mounting...');
    
    try {
      // Register the sequences
      conductor.registerSequence(PANEL_TOGGLE_SEQUENCE);
      conductor.registerSequence(LAYOUT_MODE_CHANGE_SEQUENCE);
      
      // Register handlers with event bus
      eventBus.subscribe('layout:panel:toggle', handlePanelToggled);
      eventBus.subscribe('layout:change', handleLayoutChanged);
      eventBus.subscribe('layout:animation:start', handlePanelAnimationStart);
      eventBus.subscribe('layout:animation:complete', handlePanelAnimationComplete);
      
      console.log('✅ PanelToggle Plugin: Mounted successfully');
      return true;
    } catch (error) {
      console.error('🚨 PanelToggle Plugin: Mount failed:', error);
      return false;
    }
  },
  
  unmount: (conductor: any, eventBus: any) => {
    console.log('🎼 PanelToggle Plugin: Unmounting...');
    
    try {
      // Unsubscribe from events
      eventBus.unsubscribe('layout:panel:toggle', handlePanelToggled);
      eventBus.unsubscribe('layout:change', handleLayoutChanged);
      eventBus.unsubscribe('layout:animation:start', handlePanelAnimationStart);
      eventBus.unsubscribe('layout:animation:complete', handlePanelAnimationComplete);
      
      console.log('✅ PanelToggle Plugin: Unmounted successfully');
      return true;
    } catch (error) {
      console.error('🚨 PanelToggle Plugin: Unmount failed:', error);
      return false;
    }
  }
};

export default CIAPlugin;
