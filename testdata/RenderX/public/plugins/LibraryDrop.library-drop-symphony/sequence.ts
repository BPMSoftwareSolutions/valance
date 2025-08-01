/**
 * Canvas Library Drop Symphony No. 33: "Element Creation"
 *
 * Flow Pattern: Library Drag → Canvas Drop → Element Creation → Positioning
 * Tempo: 130 BPM (♩ = 130 BPM) - Allegro - Energetic element creation
 * Key: E Major (Bright and energetic)
 * Time Signature: 4/4
 * Feel: Energetic element creation and placement
 */

import {
  EVENT_TYPES,
  MUSICAL_DYNAMICS,
  MUSICAL_TIMING,
  SEQUENCE_CATEGORIES,
  type MusicalSequence
} from '../../../src/communication/sequences/SequenceTypes';

export const CANVAS_LIBRARY_DROP_SEQUENCE: MusicalSequence = {
  name: "Canvas Library Drop Symphony No. 33",
  description: "Element Creation - Dynamic library element drop sequence",
  key: "E Major",
  tempo: 130,
  timeSignature: "4/4",
  category: SEQUENCE_CATEGORIES.CANVAS_OPERATIONS,
  movements: [{
    name: "Element Creation Allegro",
    description: "4-beat dynamic theme for library element drops",
    beats: [
      {
        beat: 1,
        event: EVENT_TYPES.LIBRARY_DRAG_START,
        title: "Library Drag Initiation",
        description: "Initiates library element drag operation",
        dynamics: MUSICAL_DYNAMICS.FORTE,
        timing: MUSICAL_TIMING.IMMEDIATE,
        dependencies: []
      },
      {
        beat: 2,
        event: EVENT_TYPES.CANVAS_DROP_VALIDATION,
        title: "Canvas Drop Validation",
        description: "Validates drop position and creates element",
        dynamics: MUSICAL_DYNAMICS.MEZZO_FORTE,
        timing: MUSICAL_TIMING.SYNCHRONIZED,
        dependencies: [EVENT_TYPES.LIBRARY_DRAG_START]
      },
      {
        beat: 3,
        event: EVENT_TYPES.CANVAS_ELEMENT_CREATED,
        title: "Element Creation",
        description: "Creates new element on canvas",
        dynamics: MUSICAL_DYNAMICS.MEZZO_FORTE,
        timing: MUSICAL_TIMING.SYNCHRONIZED,
        dependencies: [EVENT_TYPES.CANVAS_DROP_VALIDATION]
      },
      {
        beat: 4,
        event: EVENT_TYPES.CANVAS_ELEMENT_POSITIONED,
        title: "Element Positioning",
        description: "Positions element and completes creation",
        dynamics: MUSICAL_DYNAMICS.FORTE,
        timing: MUSICAL_TIMING.IMMEDIATE,
        dependencies: [EVENT_TYPES.CANVAS_ELEMENT_CREATED]
      }
    ]
  }]
};

/**
 * Start Canvas Library Drop Flow
 * CIA-compatible sequence starter
 */
export const startCanvasLibraryDropFlow = (
  conductor: any,
  libraryElement: any,
  dropPosition: { x: number; y: number },
  options: {
    validatePosition?: boolean;
    autoPosition?: boolean;
  } = {}
) => {
  // Register sequence (Valance sequence-registration-validation requirement)
  conductor.registerSequence(CANVAS_LIBRARY_DROP_SEQUENCE);
  
  return conductor.startSequence('Canvas Library Drop Symphony No. 33', {
    libraryElement,
    dropPosition,
    options,
    timestamp: new Date(),
    sequenceId: `library-drop-${Date.now()}`
  });
};
