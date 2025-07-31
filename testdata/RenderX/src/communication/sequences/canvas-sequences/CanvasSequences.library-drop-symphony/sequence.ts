/**
 * Canvas Library Drop Symphony No. 33: "Harmony of Element Creation"
 * 
 * Flow Pattern: Library Drop → Element Creation → Canvas Integration
 * Tempo: Allegro (♩ = 120 BPM) - Energetic element creation
 * Key: A Major (Bright, creative)
 * Time Signature: 4/4
 * Feel: Energetic library drop handling with coordinated element creation
 * 
 * This sequence handles Canvas library drop operations, managing drop validation,
 * element creation from library components, CSS synchronization, and cleanup.
 * 
 * @version 1.0.0
 * @author RenderX Evolution Team
 * @date 2025-07-29
 */

import type {
  MusicalSequence
} from '../../SequenceTypes';
import {
  EVENT_TYPES,
  MUSICAL_DYNAMICS,
  MUSICAL_TIMING,
  SEQUENCE_CATEGORIES
} from '../../SequenceTypes';

/**
 * Canvas Library Drop Symphony No. 33: "Harmony of Element Creation"
 * 
 * Coordinated library drop sequence that handles drop validation, element creation,
 * CSS synchronization, and cleanup for Canvas library drop operations.
 */
export const CANVAS_LIBRARY_DROP_SEQUENCE: MusicalSequence = {
  name: "Canvas Library Drop Symphony No. 33",
  description: "Harmony of Element Creation - Coordinated library drop flow",
  key: "A Major",
  tempo: 120,
  timeSignature: "4/4",
  category: SEQUENCE_CATEGORIES.CANVAS_OPERATIONS,
  movements: [{
    name: "Library Drop Allegro",
    description: "4-beat energetic theme for library drop operations",
    beats: [
      {
        beat: 1,
        event: EVENT_TYPES.CANVAS_DROP_VALIDATION,
        title: "Drop Context Validation",
        description: "Validates drop context and prepares for element creation. Checks drag data validity, drop coordinates, and container context.",
        dynamics: MUSICAL_DYNAMICS.FORTE,
        timing: MUSICAL_TIMING.IMMEDIATE,
        dependencies: [],
        errorHandling: 'continue'
      },
      {
        beat: 2,
        event: EVENT_TYPES.LIBRARY_DRAG_ENDED,
        title: "Element Creation from Library",
        description: "Creates new element from library drag data. This is the main business logic beat that handles element instantiation, positioning, and initial configuration.",
        dynamics: MUSICAL_DYNAMICS.FORTISSIMO,
        timing: MUSICAL_TIMING.IMMEDIATE,
        dependencies: [EVENT_TYPES.CANVAS_DROP_VALIDATION],
        errorHandling: 'continue'
      },
      {
        beat: 3,
        event: EVENT_TYPES.CANVAS_ELEMENT_CREATED,
        title: "CSS Synchronization",
        description: "Synchronizes CSS for newly created element. Ensures proper styling and visual integration with the Canvas.",
        dynamics: MUSICAL_DYNAMICS.FORTE,
        timing: MUSICAL_TIMING.IMMEDIATE,
        dependencies: [EVENT_TYPES.LIBRARY_DRAG_ENDED],
        errorHandling: 'continue'
      },
      {
        beat: 4,
        event: EVENT_TYPES.DROP_ZONE_CLEANUP,
        title: "Drop State Cleanup",
        description: "Cleans up drop state and finalizes library drop operation. Resets drag indicators and prepares for next operation.",
        dynamics: MUSICAL_DYNAMICS.MEZZO_FORTE,
        timing: MUSICAL_TIMING.IMMEDIATE,
        dependencies: [EVENT_TYPES.CANVAS_ELEMENT_CREATED],
        errorHandling: 'continue'
      }
    ]
  }],
  metadata: {
    version: "1.0.0",
    author: "RenderX Evolution System",
    created: new Date(),
    tags: ["canvas", "library-drop", "element-creation", "drag-drop"]
  }
};

/**
 * Start Canvas Library Drop Flow
 * 
 * Convenience function to initiate the Canvas library drop symphony.
 * Handles the complete library drop flow from validation through cleanup.
 * 
 * @param conductor - The musical conductor instance
 * @param dragData - Data about the dragged element from the library
 * @param dropCoordinates - Coordinates where the element was dropped
 * @param containerContext - Context about the drop container
 * @param eventData - Original drop event data
 * @returns Sequence execution ID
 */
export const startCanvasLibraryDropFlow = (
  conductor: any,
  dragData: {
    type: string;
    componentId: string;
    metadata?: Record<string, any>;
  },
  dropCoordinates: {
    x: number;
    y: number;
    canvasX?: number;
    canvasY?: number;
  },
  containerContext: {
    containerId?: string;
    containerType?: string;
    isValidDropZone: boolean;
  } = { isValidDropZone: true },
  eventData: Record<string, any> = {}
): string => {
  return conductor.startSequence('Canvas Library Drop Symphony No. 33', {
    dragData,
    dropCoordinates,
    containerContext,
    eventData,
    timestamp: eventData.timestamp || Date.now(),
    sequenceId: `canvas-library-drop-${Date.now()}`,
    context: {
      source: 'canvas-sequence',
      operation: 'library-drop',
      elementType: dragData?.type || 'unknown',
      phase: 'initialization'
    }
  });
};

/**
 * Register Canvas Library Drop Sequence with Conductor
 * Ensures sequence is properly registered before being called
 *
 * @param conductor - The musical conductor instance
 */
export const registerCanvasLibraryDropSequence = (conductor: any): void => {
  if (!conductor) {
    console.warn('🚨 Canvas Library Drop: No conductor provided for registration');
    return;
  }

  console.log('🎼 Registering Canvas Library Drop Musical Sequence');

  // Register sequence with proper sequence name
  conductor.registerSequence(CANVAS_LIBRARY_DROP_SEQUENCE);

  console.log('✅ Canvas Library Drop sequence registered successfully');
};

// Auto-register sequence when this module is imported (for validation purposes)
// Note: This will be overridden by the main registration system
if (typeof window !== 'undefined' && (window as any).renderxConductor) {
  registerCanvasLibraryDropSequence((window as any).renderxConductor);
}
