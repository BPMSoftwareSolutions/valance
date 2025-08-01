/**
 * Panel Toggle Symphony No. 1: "Layout Control"
 *
 * Flow Pattern: Panel Toggle → Layout Change → Animation → Complete
 * Tempo: 100 BPM (♩ = 100 BPM) - Andante - Smooth and controlled
 * Key: F Major (Smooth and harmonious)
 * Time Signature: 4/4
 * Feel: Smooth and controlled panel transitions
 */

import {
  EVENT_TYPES,
  MUSICAL_DYNAMICS,
  MUSICAL_TIMING,
  SEQUENCE_CATEGORIES,
  MusicalSequence,
} from "../../../src/communication/sequences/SequenceTypes";

export const PANEL_TOGGLE_SEQUENCE: MusicalSequence = {
  name: "Panel Toggle Symphony No. 1",
  description:
    "Layout Control - Dynamic panel visibility and layout management",
  key: "F Major",
  tempo: 100,
  timeSignature: "4/4",
  category: SEQUENCE_CATEGORIES.LAYOUT_ELEMENT,
  movements: [
    {
      name: "Panel State Change Movement",
      description: "Handles the core panel state change operation",
      beats: [
        {
          beat: 1,
          event: EVENT_TYPES.PANEL_TOGGLED,
          title: "Panel Toggle Initiated",
          description: "Initiates the panel toggle operation with state change",
          dynamics: MUSICAL_DYNAMICS.FORTE,
          timing: MUSICAL_TIMING.IMMEDIATE,
          dependencies: [],
        },
        {
          beat: 2,
          event: EVENT_TYPES.LAYOUT_CHANGED,
          title: "Layout Change Processing",
          description: "Processes layout changes and updates",
          dynamics: MUSICAL_DYNAMICS.MEZZO_FORTE,
          timing: MUSICAL_TIMING.SYNCHRONIZED,
          dependencies: [EVENT_TYPES.PANEL_TOGGLED],
        },
        {
          beat: 3,
          event: EVENT_TYPES.PANEL_ANIMATION_START,
          title: "Panel Animation",
          description: "Handles panel animation transitions",
          dynamics: MUSICAL_DYNAMICS.MEZZO_FORTE,
          timing: MUSICAL_TIMING.SYNCHRONIZED,
          dependencies: [EVENT_TYPES.LAYOUT_CHANGED],
        },
        {
          beat: 4,
          event: EVENT_TYPES.PANEL_ANIMATION_COMPLETE,
          title: "Animation Complete",
          description: "Completes panel animation and finalizes state",
          dynamics: MUSICAL_DYNAMICS.FORTE,
          timing: MUSICAL_TIMING.IMMEDIATE,
          dependencies: [EVENT_TYPES.PANEL_ANIMATION_START],
        },
      ],
    },
  ],
};

export const LAYOUT_MODE_CHANGE_SEQUENCE: MusicalSequence = {
  name: "Layout Mode Change Symphony",
  description: "Layout Mode Change - Dynamic layout mode transitions",
  key: "F Major",
  tempo: 100,
  timeSignature: "4/4",
  category: SEQUENCE_CATEGORIES.LAYOUT_ELEMENT,
  movements: [
    {
      name: "Layout Mode Transition",
      description: "Handles layout mode changes",
      beats: [
        {
          beat: 1,
          event: EVENT_TYPES.LAYOUT_CHANGED,
          title: "Layout Mode Change",
          description: "Changes layout mode and updates interface",
          dynamics: MUSICAL_DYNAMICS.FORTE,
          timing: MUSICAL_TIMING.IMMEDIATE,
          dependencies: [],
        },
      ],
    },
  ],
};

/**
 * Start Panel Toggle Flow
 * CIA-compatible sequence starter
 */
export const startPanelToggleFlow = (
  conductor: any,
  panelType: "elementLibrary" | "controlPanel",
  newState: boolean,
  options: {
    animated?: boolean;
    duration?: number;
    updateLayout?: boolean;
  } = {}
) => {
  // Register sequence (Valance sequence-registration-validation requirement)
  conductor.registerSequence(PANEL_TOGGLE_SEQUENCE);

  return conductor.startSequence("Panel Toggle Symphony No. 1", {
    panelType,
    newState,
    options,
    timestamp: new Date(),
    sequenceId: `panel-toggle-${Date.now()}`,
  });
};

export const startLayoutModeChangeFlow = (
  conductor: any,
  newMode: string,
  options: any = {}
) => {
  // Register sequence (Valance sequence-registration-validation requirement)
  conductor.registerSequence(LAYOUT_MODE_CHANGE_SEQUENCE);

  return conductor.startSequence("Layout Mode Change Symphony", {
    newMode,
    options,
    timestamp: new Date(),
    sequenceId: `layout-change-${Date.now()}`,
  });
};
