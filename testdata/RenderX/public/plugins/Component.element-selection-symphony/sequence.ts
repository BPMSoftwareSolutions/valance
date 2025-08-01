/**
 * Canvas Element Selection Symphony No. 37: "Selection Harmony"
 *
 * Flow Pattern: Selection Detection → Processing → Visual Feedback → State Management
 * Tempo: 120 BPM (♩ = 120 BPM) - Moderato - Smooth and responsive selection
 * Key: F Major (Harmonious and balanced)
 * Time Signature: 4/4
 * Feel: Dynamic element selection with visual feedback and state coordination
 */

import {
  EVENT_TYPES,
  MUSICAL_DYNAMICS,
  MUSICAL_TIMING,
  SEQUENCE_CATEGORIES,
  type MusicalSequence
} from '../../../src/communication/sequences/SequenceTypes';

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
        event: EVENT_TYPES.CANVAS_SELECTION_VISUAL_UPDATE,
        title: "Visual Feedback Coordination",
        description: "Coordinates visual feedback for selected elements. Updates selection indicators, manages highlight states, and synchronizes visual cues across the canvas interface.",
        dynamics: MUSICAL_DYNAMICS.MEZZO_FORTE,
        timing: MUSICAL_TIMING.SYNCHRONIZED,
        dependencies: [EVENT_TYPES.CANVAS_SELECTION_CHANGED],
        errorHandling: 'continue'
      },
      {
        beat: 4,
        event: EVENT_TYPES.CANVAS_SELECTION_STATE_SYNC,
        title: "Selection State Management",
        description: "Manages selection state persistence and coordination. Updates global selection state, handles selection history, and coordinates with other system components.",
        dynamics: MUSICAL_DYNAMICS.FORTE,
        timing: MUSICAL_TIMING.IMMEDIATE,
        dependencies: [EVENT_TYPES.CANVAS_SELECTION_VISUAL_UPDATE],
        errorHandling: 'continue'
      }
    ]
  }]
};

/**
 * Start Canvas Element Selection Flow
 * CIA-compatible sequence starter
 */
export const startCanvasElementSelectionFlow = (
  conductor: any,
  element: any,
  selectionType: 'single' | 'multi' | 'range' = 'single',
  options: {
    clearPrevious?: boolean;
    visualFeedback?: boolean;
    updateHistory?: boolean;
  } = {}
) => {
  // Register sequence (Valance sequence-registration-validation requirement)
  conductor.registerSequence(CANVAS_ELEMENT_SELECTION_SEQUENCE);
  
  return conductor.startSequence('Canvas Element Selection Symphony No. 37', {
    element,
    selectionType,
    options,
    timestamp: new Date(),
    sequenceId: `canvas-selection-${Date.now()}`
  });
};
