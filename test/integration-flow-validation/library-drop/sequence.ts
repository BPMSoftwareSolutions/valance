/**
 * Library Drop Symphony Sequence Definition
 * This file defines the musical sequence for canvas library drop operations
 * NOTE: This symphony is NOT registered anywhere - should trigger violation
 */

export const CANVAS_LIBRARY_DROP_SEQUENCE = {
  name: 'canvas-library-drop-symphony',
  description: 'Orchestrates library component drop operations on canvas',
  category: 'canvas-interaction',
  priority: 'high',
  
  movements: [
    {
      name: 'drop-detection',
      description: 'Detect and validate library component drop',
      beats: [
        {
          beat: 1,
          event: 'drop-start-detected',
          title: 'Drop Detection',
          description: 'Detect library component drop on canvas',
          timing: 'immediate',
          actions: ['validateDropData', 'checkDropZone', 'prepareCreation']
        }
      ]
    },
    {
      name: 'component-creation',
      description: 'Create new component from library drop',
      beats: [
        {
          beat: 2,
          event: 'component-instantiation',
          title: 'Component Creation',
          description: 'Instantiate new component from library data',
          timing: 'fast',
          actions: ['createComponent', 'setPosition', 'applyStyles']
        }
      ]
    }
  ],

  // Event mappings that should have corresponding UI handlers
  eventMap: {
    'drop-start-detected': {
      expectedHandler: 'handleCanvasLibraryDrop',
      uiTrigger: 'onDrop',
      description: 'UI handler should call this symphony when library drop occurs'
    }
  }
};

// NOTE: This symphony is defined but NOT registered in any hooks.ts or conductor file
// This should trigger a "SymphonyNotRegistered" violation

export default CANVAS_LIBRARY_DROP_SEQUENCE;
