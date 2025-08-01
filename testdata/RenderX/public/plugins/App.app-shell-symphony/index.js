/**
 * App Shell Symphony Plugin Entry Point
 * 
 * Main entry point for the App Shell Symphony SPA plugin. Provides the
 * complete application shell including layout management, theme switching,
 * and panel coordination for RX.Evolution.client.
 * 
 * This plugin replaces the inline components from the original App.tsx
 * with a pure SPA plugin architecture.
 */

import { sequence } from './sequence.js';
import { onLayoutChange, onPanelToggle, onThemeChange, onShellReady } from './handlers/index.js';
import { MainComponent } from './components/index.js';

/**
 * Plugin Information
 */
export const pluginInfo = {
  id: 'app-shell-symphony',
  name: 'App Shell Symphony',
  version: '1.0.0',
  description: 'Main application shell and layout management for RX.Evolution.client',
  author: 'RenderX Team',
  type: 'symphony',
  capabilities: ['layout', 'shell', 'navigation', 'theme-management'],
  dependencies: [],
  spa: {
    tempo: 140,
    key: 'G-major',
    movements: 4
  },
  evolution: {
    isCore: true,
    priority: 1,
    autoMount: true,
    layoutProvider: true
  }
};

/**
 * Handlers object for CIA mounting
 * Maps movement labels to handler functions
 */
export const handlers = {
  onLayoutChange,
  onPanelToggle,
  onThemeChange,
  onShellReady
};

/**
 * Components object for Evolution-specific CIA mounting
 * Maps component names to React components
 */
export const components = {
  MainComponent
};

/**
 * SPA Plugin Exports
 * 
 * Required exports for SPA plugin architecture:
 * - sequence: Musical sequence definition
 * - handlers: Movement handler functions
 * - components: React components (Evolution-specific)
 */
export { sequence };

/**
 * Plugin Lifecycle Hooks
 */
export const lifecycle = {
  /**
   * Called when plugin is loaded
   */
  onLoad: () => {
    console.log('🎼 App Shell Symphony: Plugin loaded');
    
    // Initialize app shell state if not exists
    if (typeof window !== 'undefined') {
      if (!window.RenderX) {
        window.RenderX = {};
      }
      
      if (!window.RenderX.appShellState) {
        window.RenderX.appShellState = {
          layoutMode: 'editor',
          panels: {
            elementLibrary: true,
            controlPanel: true
          },
          theme: 'system',
          resolvedTheme: 'light',
          isReady: false,
          loadedAt: new Date().toISOString()
        };
      }
    }
  },

  /**
   * Called when plugin is mounted to conductor
   */
  onMount: (conductor) => {
    console.log('🎼 App Shell Symphony: Plugin mounted to conductor');
    
    // Store conductor reference
    if (typeof window !== 'undefined') {
      if (!window.RenderX) {
        window.RenderX = {};
      }
      window.RenderX.appShellConductor = conductor;
    }
    
    // Emit plugin ready event
    if (typeof window !== 'undefined' && window.RenderX?.eventBus) {
      window.RenderX.eventBus.emit('app-shell:plugin:ready', {
        pluginId: pluginInfo.id,
        capabilities: pluginInfo.capabilities,
        timestamp: new Date().toISOString()
      });
    }
  },

  /**
   * Called when plugin is unmounted
   */
  onUnmount: () => {
    console.log('🎼 App Shell Symphony: Plugin unmounted');
    
    // Clean up conductor reference
    if (typeof window !== 'undefined' && window.RenderX) {
      delete window.RenderX.appShellConductor;
    }
  },

  /**
   * Called when plugin encounters an error
   */
  onError: (error, context) => {
    console.error('🚨 App Shell Symphony: Plugin error:', error);
    
    // Emit error event
    if (typeof window !== 'undefined' && window.RenderX?.eventBus) {
      window.RenderX.eventBus.emit('app-shell:plugin:error', {
        pluginId: pluginInfo.id,
        error: error.message,
        context,
        timestamp: new Date().toISOString()
      });
    }
  }
};

/**
 * Plugin Utilities
 */
export const utils = {
  /**
   * Get app shell state
   */
  getAppShellState: () => {
    if (typeof window !== 'undefined' && window.RenderX?.appShellState) {
      return window.RenderX.appShellState;
    }
    return null;
  },

  /**
   * Get current layout mode
   */
  getLayoutMode: () => {
    const state = utils.getAppShellState();
    return state?.layoutMode || 'editor';
  },

  /**
   * Get panel visibility state
   */
  getPanelState: (panelName) => {
    const state = utils.getAppShellState();
    return state?.panels?.[panelName] || false;
  },

  /**
   * Get current theme
   */
  getCurrentTheme: () => {
    const state = utils.getAppShellState();
    return {
      theme: state?.theme || 'system',
      resolvedTheme: state?.resolvedTheme || 'light'
    };
  },

  /**
   * Check if shell is ready
   */
  isShellReady: () => {
    const state = utils.getAppShellState();
    return state?.isReady || false;
  }
};

/**
 * Default Export for Dynamic Imports
 */
export default {
  sequence,
  handlers,
  components,
  pluginInfo,
  lifecycle,
  utils
};

/**
 * Plugin Validation
 */
if (typeof window !== 'undefined' && window.RenderX?.debug) {
  // Validate sequence structure
  if (!sequence || !sequence.id || !sequence.movements) {
    console.error('🚨 App Shell Symphony: Invalid sequence structure');
  }
  
  // Validate handlers
  if (!handlers || typeof handlers !== 'object') {
    console.error('🚨 App Shell Symphony: Invalid handlers structure');
  }
  
  // Validate components
  if (!components || typeof components !== 'object') {
    console.error('🚨 App Shell Symphony: Invalid components structure');
  }
  
  // Validate movement-to-handler alignment
  if (sequence && sequence.movements && handlers) {
    sequence.movements.forEach(movement => {
      if (!handlers[movement.label]) {
        console.error(`🚨 App Shell Symphony: Missing handler for movement: ${movement.label}`);
      }
    });
  }
  
  console.log('✅ App Shell Symphony: Plugin structure validation complete');
}
