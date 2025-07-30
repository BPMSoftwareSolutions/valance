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
  type MusicalSequence
} from '../../SequenceTypes';

export const CANVAS_COMPONENT_DRAG_SEQUENCE: MusicalSequence = {
  name: "Canvas Component Drag Symphony No. 4",
  description: "Dynamic Movement - Dynamic drag operation flow",
  key: "D Major",
  tempo: 140,
  timeSignature: "4/4",
  category: SEQUENCE_CATEGORIES.CANVAS_OPERATIONS,
  movements: [{
    name: "Canvas Drag Coordination Allegro",
    description: "4-beat dynamic theme for canvas drag operations",
    beats: [
      {
        beat: 1,
        event: EVENT_TYPES.CANVAS_DRAG_OVER,
        title: "Canvas Drag Initiation",
        description: "Initiates canvas drag operation and prepares element for movement. Captures initial position, validates drag permissions, and sets up drag state.",
        dynamics: MUSICAL_DYNAMICS.FORTE,
        timing: MUSICAL_TIMING.IMMEDIATE,
        dependencies: []
      },
      {
        beat: 2,
        event: EVENT_TYPES.CANVAS_ELEMENT_MOVED,
        title: "Element Movement Processing",
        description: "Processes element movement with real-time position updates. Handles drag constraints, collision detection, and visual feedback.",
        dynamics: MUSICAL_DYNAMICS.MEZZO_FORTE,
        timing: MUSICAL_TIMING.SYNCHRONIZED,
        dependencies: [EVENT_TYPES.CANVAS_DRAG_OVER]
      },
      {
        beat: 3,
        event: EVENT_TYPES.CANVAS_DROP_VALIDATION,
        title: "Drag Position Validation",
        description: "Validates drag position and checks for valid drop zones. Performs boundary validation, overlap detection, and drop zone compatibility.",
        dynamics: MUSICAL_DYNAMICS.MEZZO_FORTE,
        timing: MUSICAL_TIMING.IMMEDIATE,
        dependencies: [EVENT_TYPES.CANVAS_ELEMENT_MOVED]
      },
      {
        beat: 4,
        event: EVENT_TYPES.CANVAS_DROP,
        title: "Drag Operation Completion",
        description: "Completes drag operation and finalizes element position. Updates element coordinates, triggers position-dependent operations, and cleans up drag state.",
        dynamics: MUSICAL_DYNAMICS.FORTE,
        timing: MUSICAL_TIMING.IMMEDIATE,
        dependencies: [EVENT_TYPES.CANVAS_DROP_VALIDATION]
      }
    ]
  }]
};

export const startCanvasComponentDragFlow = (
  conductorEventBus: any,
  element: any,
  eventData: any,
  elements?: any[],
  setElements?: (updater: (prev: any[]) => any[]) => void,
  syncElementCSS?: (element: any, cssData: any) => void
) => {
  return conductorEventBus.startSequence('canvas-component-drag-symphony', {
    element,
    elementId: element?.id,
    changes: eventData?.changes || {},
    source: eventData?.source || 'canvas-component-drag',
    elements: elements || [],
    setElements,
    syncElementCSS,
    event: eventData,
    timestamp: eventData.timestamp || Date.now(),
    sequenceId: `canvas-drag-${Date.now()}`,
    context: {
      source: 'canvas-component-drag',
      operation: 'element-drag',
      elementType: element?.type || 'unknown'
    }
  });
};
