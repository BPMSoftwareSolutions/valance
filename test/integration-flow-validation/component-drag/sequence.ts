/**
 * Component Drag Symphony Sequence Definition
 * This file defines the musical sequence for canvas component drag operations
 */

export const CANVAS_COMPONENT_DRAG_SEQUENCE = {
  name: 'canvas-component-drag-symphony',
  description: 'Orchestrates canvas component drag and drop operations with musical timing',
  category: 'canvas-interaction',
  priority: 'high',
  
  movements: [
    {
      name: 'drag-initiation',
      description: 'Initialize drag operation and prepare canvas state',
      beats: [
        {
          beat: 1,
          event: 'drag-start-detected',
          title: 'Drag Start Detection',
          description: 'Detect and validate drag start event',
          timing: 'immediate',
          actions: ['validateDragSource', 'prepareDragData', 'updateCursor']
        },
        {
          beat: 2, 
          event: 'drag-state-setup',
          title: 'Drag State Setup',
          description: 'Setup drag state and visual feedback',
          timing: 'fast',
          actions: ['setDragState', 'addVisualFeedback', 'notifyComponents']
        }
      ]
    },
    {
      name: 'drag-coordination',
      description: 'Coordinate drag operation across canvas components',
      beats: [
        {
          beat: 3,
          event: 'drag-over-detection',
          title: 'Drag Over Detection', 
          description: 'Detect drag over valid drop zones',
          timing: 'continuous',
          actions: ['validateDropZone', 'updateDropIndicator', 'calculatePosition']
        },
        {
          beat: 4,
          event: 'drag-feedback-update',
          title: 'Drag Feedback Update',
          description: 'Update visual feedback during drag',
          timing: 'smooth',
          actions: ['updateGhostElement', 'highlightDropZones', 'updateCoordinates']
        }
      ]
    },
    {
      name: 'drag-completion',
      description: 'Complete drag operation and update canvas state',
      beats: [
        {
          beat: 5,
          event: 'drag-drop-validation',
          title: 'Drop Validation',
          description: 'Validate drop location and prepare for completion',
          timing: 'immediate',
          actions: ['validateDropTarget', 'calculateFinalPosition', 'prepareStateUpdate']
        },
        {
          beat: 6,
          event: 'drag-completion-cleanup',
          title: 'Drag Completion Cleanup',
          description: 'Clean up drag state and finalize operation',
          timing: 'fast',
          actions: ['clearDragState', 'removeVisualFeedback', 'updateElementPosition', 'notifyCompletion']
        }
      ]
    }
  ],

  // Event mappings that should have corresponding UI handlers
  eventMap: {
    'drag-start-detected': {
      expectedHandler: 'handleCanvasElementDragStart',
      uiTrigger: 'onDragStart',
      description: 'UI handler should call this symphony when drag starts'
    },
    'drag-over-detection': {
      expectedHandler: 'handleDragOver', 
      uiTrigger: 'onDragOver',
      description: 'UI handler should coordinate with this symphony during drag over'
    },
    'drag-drop-validation': {
      expectedHandler: 'handleDrop',
      uiTrigger: 'onDrop', 
      description: 'UI handler should complete this symphony on drop'
    }
  },

  // Configuration
  config: {
    timing: {
      dragStartDelay: 0,
      feedbackUpdateInterval: 16, // 60fps
      completionDelay: 100
    },
    validation: {
      requireValidDropZone: true,
      allowSelfDrop: false,
      validateBoundaries: true
    }
  }
};

export default CANVAS_COMPONENT_DRAG_SEQUENCE;
