/**
 * JSON Component Loading Symphony No. 1: "Component Loading"
 *
 * Flow Pattern: Loading Start → Progress → Complete → Error Handling
 * Tempo: 110 BPM (♩ = 110 BPM) - Moderato - Steady and reliable
 * Key: C Major (Simple and reliable)
 * Time Signature: 4/4
 * Feel: Steady and reliable component loading
 */

import {
  EVENT_TYPES,
  MUSICAL_DYNAMICS,
  MUSICAL_TIMING,
  SEQUENCE_CATEGORIES,
  type MusicalSequence
} from '../../../src/communication/sequences/SequenceTypes';

export const JSON_COMPONENT_LOADING_SEQUENCE: MusicalSequence = {
  name: "JSON Component Loading Symphony No. 1",
  description: "Component Loading - Dynamic JSON component loading and error handling",
  key: "C Major",
  tempo: 110,
  timeSignature: "4/4",
  category: SEQUENCE_CATEGORIES.COMPONENT_UI,
  movements: [{
    name: "Component Discovery Movement",
    description: "Discovers and validates JSON component files",
    beats: [
      {
        beat: 1,
        event: EVENT_TYPES.COMPONENT_LOADING_STARTED,
        title: "Initiate Component Loading",
        description: "Starts the JSON component loading process",
        dynamics: MUSICAL_DYNAMICS.FORTE,
        timing: MUSICAL_TIMING.IMMEDIATE,
        dependencies: []
      },
      {
        beat: 2,
        event: EVENT_TYPES.COMPONENT_LOADING_PROGRESS,
        title: "Component Loading Progress",
        description: "Tracks component loading progress",
        dynamics: MUSICAL_DYNAMICS.MEZZO_FORTE,
        timing: MUSICAL_TIMING.SYNCHRONIZED,
        dependencies: [EVENT_TYPES.COMPONENT_LOADING_STARTED]
      },
      {
        beat: 3,
        event: EVENT_TYPES.COMPONENT_LOADING_COMPLETED,
        title: "Component Discovery Complete",
        description: "Completes the component file discovery phase",
        dynamics: MUSICAL_DYNAMICS.MEZZO_FORTE,
        timing: MUSICAL_TIMING.SYNCHRONIZED,
        dependencies: [EVENT_TYPES.COMPONENT_LOADING_PROGRESS]
      },
      {
        beat: 4,
        event: EVENT_TYPES.COMPONENT_LOADING_ERROR,
        title: "Component Loading Error Handling",
        description: "Handles any errors during component loading",
        dynamics: MUSICAL_DYNAMICS.FORTE,
        timing: MUSICAL_TIMING.IMMEDIATE,
        dependencies: []
      }
    ]
  }]
};

export const JSON_COMPONENT_ERROR_SEQUENCE: MusicalSequence = {
  name: "JSON Component Error Handling Symphony No. 2",
  description: "Error Handling - Component loading error management",
  key: "C Minor",
  tempo: 90,
  timeSignature: "4/4",
  category: SEQUENCE_CATEGORIES.COMPONENT_UI,
  movements: [{
    name: "Error Recovery Movement",
    description: "Handles and recovers from component loading errors",
    beats: [
      {
        beat: 1,
        event: EVENT_TYPES.COMPONENT_LOADING_ERROR,
        title: "Error Detection",
        description: "Detects and categorizes component loading errors",
        dynamics: MUSICAL_DYNAMICS.FORTE,
        timing: MUSICAL_TIMING.IMMEDIATE,
        dependencies: []
      }
    ]
  }]
};

/**
 * Start JSON Component Loading Flow
 * CIA-compatible sequence starter
 */
export const startJsonComponentLoadingFlow = (
  conductor: any,
  componentFiles: any[],
  options: {
    validateStructure?: boolean;
    autoRegister?: boolean;
    errorHandling?: string;
  } = {}
) => {
  // Register sequence (Valance sequence-registration-validation requirement)
  conductor.registerSequence(JSON_COMPONENT_LOADING_SEQUENCE);
  
  return conductor.startSequence('JSON Component Loading Symphony No. 1', {
    componentFiles,
    options,
    timestamp: new Date(),
    sequenceId: `json-loading-${Date.now()}`
  });
};

export const startJsonComponentErrorFlow = (
  conductor: any,
  error: any,
  context: any
) => {
  // Register sequence (Valance sequence-registration-validation requirement)
  conductor.registerSequence(JSON_COMPONENT_ERROR_SEQUENCE);
  
  return conductor.startSequence('JSON Component Error Handling Symphony No. 2', {
    error,
    context,
    timestamp: new Date(),
    sequenceId: `json-error-${Date.now()}`
  });
};
