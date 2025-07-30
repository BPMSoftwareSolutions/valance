/**
 * Component Drag Symphony Hooks
 * Registers the canvas-component-drag-symphony with the Musical Conductor
 */

import { MusicalConductor } from '../../../communication/sequences/MusicalConductor';
import { CANVAS_COMPONENT_DRAG_SEQUENCE } from './sequence';

/**
 * Register the canvas-component-drag-symphony with the conductor
 */
export function registerCanvasComponentDragSymphony(conductor: MusicalConductor) {
  console.log('🎼 Registering Canvas Component Drag Symphony...');

  // VALID: Proper symphony registration
  conductor.defineSequence('canvas-component-drag-symphony', CANVAS_COMPONENT_DRAG_SEQUENCE);

  console.log('✅ Canvas Component Drag Symphony registered successfully');
}

/**
 * Initialize drag-related event handlers and symphony integration
 */
export function initializeCanvasComponentDragIntegration(conductor: MusicalConductor) {
  console.log('🎼 Initializing Canvas Component Drag Integration...');

  // Register the symphony
  registerCanvasComponentDragSymphony(conductor);

  // Set up any additional drag-related configuration
  conductor.configureSequence('canvas-component-drag-symphony', {
    priority: 'high',
    autoStart: false,
    maxConcurrentExecutions: 1
  });

  console.log('✅ Canvas Component Drag Integration initialized');
}

export default {
  registerCanvasComponentDragSymphony,
  initializeCanvasComponentDragIntegration
};
