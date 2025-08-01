/**
 * Canvas Component Drag Symphony No. 4: "Dynamic Movement"
 *
 * Flow Pattern: Drag Start → Position Update → State Coordination → CSS Sync
 * Tempo: 140 BPM (♩ = 140 BPM) - Allegro - Fast and responsive drag operations
 * Key: D Major (Strong and dynamic)
 * Time Signature: 4/4
 * Feel: Dynamic element dragging with real-time position updates
 */

import {
  EVENT_TYPES,
  MUSICAL_DYNAMICS,
  MUSICAL_TIMING,
  SEQUENCE_CATEGORIES,
  MusicalSequence,
} from "../../../src/communication/sequences/SequenceTypes";

export const CANVAS_COMPONENT_DRAG_SEQUENCE: MusicalSequence = {
  name: "Canvas Component Drag Symphony No. 4",
  description: "Dynamic Movement - Dynamic drag operation flow",
  key: "D Major",
  tempo: 140,
  timeSignature: "4/4",
  category: SEQUENCE_CATEGORIES.CANVAS_OPERATIONS,
  movements: [
    {
      name: "Canvas Drag Coordination Allegro",
      description: "4-beat dynamic theme for canvas drag operations",
      beats: [
        {
          beat: 1,
          event: EVENT_TYPES.CANVAS_DRAG_OVER,
          title: "Canvas Drag Initiation",
          description:
            "Initiates canvas drag operation and prepares element for movement. Captures initial position, validates drag permissions, and sets up drag state.",
          dynamics: MUSICAL_DYNAMICS.FORTE,
          timing: MUSICAL_TIMING.IMMEDIATE,
          dependencies: [],
        },
        {
          beat: 2,
          event: EVENT_TYPES.CANVAS_ELEMENT_MOVED,
          title: "Element Movement Processing",
          description:
            "Processes element movement with real-time position updates. Handles drag constraints, collision detection, and visual feedback.",
          dynamics: MUSICAL_DYNAMICS.MEZZO_FORTE,
          timing: MUSICAL_TIMING.SYNCHRONIZED,
          dependencies: [EVENT_TYPES.CANVAS_DRAG_OVER],
        },
        {
          beat: 3,
          event: EVENT_TYPES.CANVAS_DROP_VALIDATION,
          title: "Drop Validation & State Update",
          description:
            "Validates drop position and updates element state. Handles drop zone validation, state persistence, and conflict resolution.",
          dynamics: MUSICAL_DYNAMICS.MEZZO_FORTE,
          timing: MUSICAL_TIMING.SYNCHRONIZED,
          dependencies: [EVENT_TYPES.CANVAS_ELEMENT_MOVED],
        },
        {
          beat: 4,
          event: EVENT_TYPES.CANVAS_ELEMENT_CSS_SYNC,
          title: "CSS Synchronization Finale",
          description:
            "Synchronizes CSS properties with final element state. Updates visual properties, applies transformations, and completes drag operation.",
          dynamics: MUSICAL_DYNAMICS.FORTE,
          timing: MUSICAL_TIMING.IMMEDIATE,
          dependencies: [EVENT_TYPES.CANVAS_DROP_VALIDATION],
        },
      ],
    },
  ],
};

/**
 * Start Canvas Component Drag Flow
 * CIA-compatible sequence starter
 */
export const startCanvasComponentDragFlow = (
  conductorEventBus: any,
  element: any,
  eventData: any,
  elements?: any[],
  setElements?: (updater: (prev: any[]) => any[]) => void,
  syncElementCSS?: (element: any, cssData: any) => void
) => {
  // Register sequence (Valance sequence-registration-validation requirement)
  conductorEventBus.registerSequence(CANVAS_COMPONENT_DRAG_SEQUENCE);

  return conductorEventBus.startSequence(
    "Canvas Component Drag Symphony No. 4",
    {
      element,
      eventData,
      elements,
      setElements,
      syncElementCSS,
      timestamp: new Date(),
      sequenceId: `canvas-drag-${Date.now()}`,
    }
  );
};
