/**
 * JSON Component Loading Symphony No. 1 Plugin
 * Entry Point and Exports
 */

// Core sequence and flow
export { JSON_COMPONENT_LOADING_SEQUENCE, JSON_COMPONENT_ERROR_SEQUENCE, startJsonComponentLoadingFlow, startJsonComponentErrorFlow } from './sequence';

// Individual handlers
export { default as handleComponentLoadingStarted } from './handlers/onLoadStart';
export { default as handleComponentLoadingProgress } from './handlers/onLoadProgress';
export { default as handleComponentLoadingCompleted } from './handlers/onLoadComplete';
export { default as handleComponentLoadingError } from './handlers/onLoadError';

// Business logic
export { validateComponentStructure, processComponentLoading } from './logic';

// React hooks
export { useJsonComponentLoader, default as useJsonComponentLoaderDefault } from './hooks';

// Plugin metadata
export const PLUGIN_INFO = {
  id: "JsonLoader.json-component-symphony",
  name: "JSON Component Loading Symphony No. 1",
  version: "1.0.0",
  description: "Component Loading - Dynamic JSON component loading and error handling",
  category: "component-operations",
  type: "symphony-plugin"
};

// CIA Plugin Interface
export const CIAPlugin = {
  mount: (conductor: any, eventBus: any) => {
    console.log('🎼 JsonLoader Plugin: Mounting...');
    
    try {
      // Register the sequences
      conductor.registerSequence(JSON_COMPONENT_LOADING_SEQUENCE);
      conductor.registerSequence(JSON_COMPONENT_ERROR_SEQUENCE);
      
      // Register handlers with event bus
      eventBus.subscribe('component:load:start', handleComponentLoadingStarted);
      eventBus.subscribe('component:load:progress', handleComponentLoadingProgress);
      eventBus.subscribe('component:load:complete', handleComponentLoadingCompleted);
      eventBus.subscribe('component:load:error', handleComponentLoadingError);
      
      console.log('✅ JsonLoader Plugin: Mounted successfully');
      return true;
    } catch (error) {
      console.error('🚨 JsonLoader Plugin: Mount failed:', error);
      return false;
    }
  },
  
  unmount: (conductor: any, eventBus: any) => {
    console.log('🎼 JsonLoader Plugin: Unmounting...');
    
    try {
      // Unsubscribe from events
      eventBus.unsubscribe('component:load:start', handleComponentLoadingStarted);
      eventBus.unsubscribe('component:load:progress', handleComponentLoadingProgress);
      eventBus.unsubscribe('component:load:complete', handleComponentLoadingCompleted);
      eventBus.unsubscribe('component:load:error', handleComponentLoadingError);
      
      console.log('✅ JsonLoader Plugin: Unmounted successfully');
      return true;
    } catch (error) {
      console.error('🚨 JsonLoader Plugin: Unmount failed:', error);
      return false;
    }
  }
};

export default CIAPlugin;
