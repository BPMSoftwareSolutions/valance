/**
 * Canvas Element Selection Symphony No. 37: "Selection Harmony"
 * 
 * Flow Pattern: Selection Detection → Processing → Visual Coordination → State Management
 * Tempo: Allegro (♩ = 120 BPM) - Dynamic element selection
 * Key: F Major (Harmonious, balanced)
 * Time Signature: 4/4
 * Feel: Dynamic element selection flow with coordinated visual feedback
 * 
 * This sequence handles Canvas element selection operations, managing selection detection,
 * processing, visual coordination, and state management.
 * 
 * @version 1.0.0
 * @author RenderX Evolution Team
 * @date 2025-07-29
 */

import { 
  EVENT_TYPES, 
  MUSICAL_DYNAMICS, 
  MUSICAL_TIMING, 
  SEQUENCE_CATEGORIES,
  MusicalSequence
} from '../../SequenceTypes';

/**
 * Canvas Element Selection Symphony No. 37: "Selection Harmony"
 * 
 * Dynamic element selection sequence that handles selection detection,
 * processing, visual coordination, and state management.
 */
export const CANVAS_ELEMENT_SELECTION_SEQUENCE: MusicalSequence = {
  name: "Canvas Element Selection Symphony No. 37",
  description: "Selection Harmony - Dynamic element selection flow",
  key: "F Major",
  tempo: 120,
  timeSignature: "4/4",
  category: SEQUENCE_CATEGORIES.LAYOUT_ELEMENT,
  movements: [{
    name: "Selection Harmony Allegro",
    description: "4-beat dynamic theme for element selection",
    beats: [
      {
        beat: 1,
        event: EVENT_TYPES.CANVAS_ELEMENT_SELECTED,
        title: "Element Selection Detection",
        description: "Detects element selection context and prepares for coordination. Identifies the target element, validates selection permissions, and initializes selection state management.",
        dynamics: MUSICAL_DYNAMICS.FORTE,
        timing: MUSICAL_TIMING.IMMEDIATE,
        dependencies: [],
        errorHandling: 'continue'
      },
      {
        beat: 2,
        event: EVENT_TYPES.CANVAS_SELECTION_CHANGED,
        title: "Selection Processing",
        description: "Processes element selection with visual feedback and state management. Updates selection state, manages multi-select operations, and coordinates with other Canvas elements.",
        dynamics: MUSICAL_DYNAMICS.MEZZO_FORTE,
        timing: MUSICAL_TIMING.IMMEDIATE,
        dependencies: [EVENT_TYPES.CANVAS_ELEMENT_SELECTED],
        errorHandling: 'continue'
      },
      {
        beat: 3,
        event: EVENT_TYPES.ACTIVATE_VISUAL_TOOLS,
        title: "Selection Visual Coordination",
        description: "Coordinates visual tools and feedback for selected element. Activates selection indicators, resize handles, and other visual tools for the selected element.",
        dynamics: MUSICAL_DYNAMICS.FORTE,
        timing: MUSICAL_TIMING.IMMEDIATE,
        dependencies: [EVENT_TYPES.CANVAS_SELECTION_CHANGED],
        errorHandling: 'continue'
      },
      {
        beat: 4,
        event: EVENT_TYPES.CANVAS_STATE_CHANGED,
        title: "Selection State Cleanup",
        description: "Cleans up selection state and prepares for subsequent operations. Updates Canvas state, synchronizes with control panel, and ensures consistent selection state across the system.",
        dynamics: MUSICAL_DYNAMICS.MEZZO_FORTE,
        timing: MUSICAL_TIMING.IMMEDIATE,
        dependencies: [EVENT_TYPES.ACTIVATE_VISUAL_TOOLS],
        errorHandling: 'continue'
      }
    ]
  }],
  metadata: {
    version: "1.0.0",
    author: "RenderX Evolution System",
    created: new Date(),
    tags: ["canvas", "element-selection", "visual-tools", "state-management"]
  }
};

/**
 * Start Canvas Element Selection Flow
 * 
 * Convenience function to initiate the Canvas element selection symphony.
 * Handles the complete selection flow from detection through state cleanup.
 * 
 * @param conductor - The musical conductor instance
 * @param element - The canvas element being selected
 * @param selectionContext - Context about the selection operation
 * @param eventData - Original selection event data
 * @returns Sequence execution ID
 */
export const startCanvasElementSelectionFlow = (
  conductor: any,
  element: {
    id: string;
    type: string;
    metadata?: Record<string, any>;
  },
  selectionContext: {
    selectionType?: 'single' | 'multi' | 'range';
    clearPrevious?: boolean;
    source?: 'click' | 'keyboard' | 'programmatic';
    modifiers?: {
      ctrl?: boolean;
      shift?: boolean;
      alt?: boolean;
    };
  } = {},
  eventData: Record<string, any> = {}
): string => {
  return conductor.startSequence('Canvas Element Selection Symphony No. 37', {
    element,
    selectionContext: {
      selectionType: 'single',
      clearPrevious: true,
      source: 'click',
      ...selectionContext
    },
    eventData,
    timestamp: eventData.timestamp || Date.now(),
    sequenceId: `canvas-element-selection-${Date.now()}`,
    context: {
      source: 'canvas-sequence',
      operation: 'element-selection',
      elementType: element?.type || 'unknown',
      phase: 'initialization'
    }
  });
};

/**
 * Register Canvas Element Selection Sequence with Conductor
 * Ensures sequence is properly registered before being called
 *
 * @param conductor - The musical conductor instance
 */
export const registerCanvasElementSelectionSequence = (conductor: any): void => {
  if (!conductor) {
    console.warn('🚨 Canvas Element Selection: No conductor provided for registration');
    return;
  }

  console.log('🎼 Registering Canvas Element Selection Musical Sequence');

  // Register sequence with proper sequence name
  conductor.defineSequence('Canvas Element Selection Symphony No. 37', CANVAS_ELEMENT_SELECTION_SEQUENCE);

  console.log('✅ Canvas Element Selection sequence registered successfully');
};

// Auto-register sequence when this module is imported (for validation purposes)
// Note: This will be overridden by the main registration system
if (typeof window !== 'undefined' && (window as any).renderxConductor) {
  registerCanvasElementSelectionSequence((window as any).renderxConductor);
}
