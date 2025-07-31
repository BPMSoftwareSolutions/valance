/**
 * Canvas Drag & Drop SPA Plugin
 * Example SPA plugin for canvas drag and drop operations
 * 
 * @agent-context: This is an SPA plugin that provides canvas drag and drop functionality
 * It exports a sequence definition and corresponding handlers for CIA mounting
 */

import { 
  MusicalSequence, 
  SEQUENCE_CATEGORIES, 
  MUSICAL_DYNAMICS, 
  MUSICAL_TIMING 
} from '../SequenceTypes';

// @agent-context: Canvas drag and drop sequence definition
export const sequence: MusicalSequence = {
  name: 'canvas-drag-drop-symphony',
  description: 'Orchestrates canvas drag and drop operations with visual feedback',
  key: 'D Minor',
  tempo: 140,
  timeSignature: '4/4',
  category: SEQUENCE_CATEGORIES.CANVAS_OPERATIONS,
  movements: [
    {
      name: 'DragInitiation',
      description: 'Initialize drag operation and prepare visual feedback',
      beats: [
        {
          beat: 1,
          event: 'canvas-drag-start',
          title: 'Start Drag Operation',
          description: 'Initialize drag state and capture element',
          dynamics: MUSICAL_DYNAMICS.FORTE,
          timing: MUSICAL_TIMING.IMMEDIATE,
          data: { phase: 'initiation' },
          errorHandling: 'continue'
        },
        {
          beat: 2,
          event: 'canvas-visual-feedback-start',
          title: 'Enable Visual Feedback',
          description: 'Show drag preview and highlight drop zones',
          dynamics: MUSICAL_DYNAMICS.MEZZO_FORTE,
          timing: MUSICAL_TIMING.AFTER_BEAT,
          data: { feedbackType: 'drag-preview' },
          errorHandling: 'continue'
        }
      ]
    },
    {
      name: 'DragProgress',
      description: 'Handle drag movement and update visual feedback',
      beats: [
        {
          beat: 1,
          event: 'canvas-drag-move',
          title: 'Update Drag Position',
          description: 'Track mouse movement and update drag preview',
          dynamics: MUSICAL_DYNAMICS.PIANO,
          timing: MUSICAL_TIMING.IMMEDIATE,
          data: { continuous: true },
          errorHandling: 'continue'
        },
        {
          beat: 2,
          event: 'canvas-drop-zone-highlight',
          title: 'Highlight Drop Zones',
          description: 'Highlight valid drop zones based on current position',
          dynamics: MUSICAL_DYNAMICS.MEZZO_PIANO,
          timing: MUSICAL_TIMING.SYNCHRONIZED,
          data: { highlightType: 'valid-zones' },
          errorHandling: 'continue'
        }
      ]
    },
    {
      name: 'DragCompletion',
      description: 'Complete drag operation and finalize placement',
      beats: [
        {
          beat: 1,
          event: 'canvas-drag-end',
          title: 'End Drag Operation',
          description: 'Complete drag operation and determine drop target',
          dynamics: MUSICAL_DYNAMICS.FORTISSIMO,
          timing: MUSICAL_TIMING.IMMEDIATE,
          data: { phase: 'completion' },
          errorHandling: 'abort-sequence'
        },
        {
          beat: 2,
          event: 'canvas-element-place',
          title: 'Place Element',
          description: 'Place element at drop location with animation',
          dynamics: MUSICAL_DYNAMICS.FORTE,
          timing: MUSICAL_TIMING.AFTER_BEAT,
          data: { animated: true },
          errorHandling: 'continue'
        },
        {
          beat: 3,
          event: 'canvas-visual-feedback-end',
          title: 'Clear Visual Feedback',
          description: 'Remove drag preview and drop zone highlights',
          dynamics: MUSICAL_DYNAMICS.PIANO,
          timing: MUSICAL_TIMING.DELAYED,
          data: { cleanup: true },
          errorHandling: 'continue'
        }
      ]
    }
  ],
  metadata: {
    version: '1.2.0',
    author: 'RenderX Canvas Team',
    created: new Date('2024-01-15'),
    tags: ['canvas', 'drag-drop', 'ui-interaction', 'visual-feedback']
  }
};

// @agent-context: Handler implementations for each movement
export const handlers = {
  /**
   * Handle drag initiation movement
   * @param data - Event data containing drag start information
   */
  DragInitiation: (data: any) => {
    console.log('🎯 Canvas Drag Initiation:', data);
    
    // Initialize drag state
    const dragState = {
      element: data.element,
      startPosition: data.position,
      timestamp: Date.now()
    };
    
    // Store drag state globally or in context
    if (typeof window !== 'undefined') {
      (window as any).canvasDragState = dragState;
    }
    
    // Enable visual feedback
    if (data.element) {
      data.element.classList?.add('dragging');
    }
    
    return {
      success: true,
      dragState,
      message: 'Drag initiation completed'
    };
  },

  /**
   * Handle drag progress movement
   * @param data - Event data containing current drag position
   */
  DragProgress: (data: any) => {
    console.log('🎯 Canvas Drag Progress:', data);
    
    // Get current drag state
    const dragState = (typeof window !== 'undefined') ? (window as any).canvasDragState : null;
    
    if (!dragState) {
      console.warn('No active drag state found');
      return { success: false, message: 'No active drag state' };
    }
    
    // Update drag preview position
    if (data.position && dragState.element) {
      const preview = document.querySelector('.drag-preview');
      if (preview) {
        (preview as HTMLElement).style.left = `${data.position.x}px`;
        (preview as HTMLElement).style.top = `${data.position.y}px`;
      }
    }
    
    // Highlight drop zones
    const dropZones = document.querySelectorAll('.drop-zone');
    dropZones.forEach(zone => {
      const rect = zone.getBoundingClientRect();
      const isOver = data.position && 
        data.position.x >= rect.left && 
        data.position.x <= rect.right &&
        data.position.y >= rect.top && 
        data.position.y <= rect.bottom;
      
      zone.classList.toggle('highlight', isOver);
    });
    
    return {
      success: true,
      position: data.position,
      message: 'Drag progress updated'
    };
  },

  /**
   * Handle drag completion movement
   * @param data - Event data containing final drop information
   */
  DragCompletion: (data: any) => {
    console.log('🎯 Canvas Drag Completion:', data);
    
    // Get current drag state
    const dragState = (typeof window !== 'undefined') ? (window as any).canvasDragState : null;
    
    if (!dragState) {
      console.warn('No active drag state found for completion');
      return { success: false, message: 'No active drag state for completion' };
    }
    
    // Determine drop target
    const dropTarget = data.dropTarget || document.elementFromPoint(data.position?.x || 0, data.position?.y || 0);
    
    // Place element at drop location
    if (dropTarget && dropTarget.classList.contains('drop-zone')) {
      // Successful drop
      if (dragState.element) {
        dropTarget.appendChild(dragState.element);
        dragState.element.classList?.remove('dragging');
      }
      
      console.log('✅ Element successfully dropped');
    } else {
      // Invalid drop - return to original position
      console.log('❌ Invalid drop target - returning element');
    }
    
    // Clean up visual feedback
    document.querySelectorAll('.drop-zone').forEach(zone => {
      zone.classList.remove('highlight');
    });
    
    const preview = document.querySelector('.drag-preview');
    if (preview) {
      preview.remove();
    }
    
    // Clear drag state
    if (typeof window !== 'undefined') {
      delete (window as any).canvasDragState;
    }
    
    return {
      success: true,
      dropTarget: dropTarget?.className || 'none',
      message: 'Drag operation completed'
    };
  }
};

// @agent-context: Plugin metadata for identification
export const metadata = {
  id: 'canvas-drag-drop-plugin',
  version: '1.2.0',
  author: 'RenderX Canvas Team',
  description: 'Provides comprehensive drag and drop functionality for canvas operations',
  dependencies: [],
  tags: ['canvas', 'drag-drop', 'ui-interaction']
};

// @agent-context: Default export for easy importing
export default {
  sequence,
  handlers,
  metadata
};
