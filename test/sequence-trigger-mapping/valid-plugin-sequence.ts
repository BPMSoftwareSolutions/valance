// Valid plugin sequence definition for CIA Sequence Trigger Mapping Validator
import { MusicalSequence } from "../communication/sequences/SequenceTypes";
import { SEQUENCE_CATEGORIES, MUSICAL_DYNAMICS, MUSICAL_TIMING } from "../communication/sequences/SequenceTypes";

// ✅ VALID: Properly defined sequence that should be triggered
export const COMPONENT_DRAG_SEQUENCE: MusicalSequence = {
  name: "Component Drag Symphony No. 5",
  description: "Test sequence for trigger mapping validation",
  key: "C Major",
  tempo: 120,
  timeSignature: "4/4",
  category: SEQUENCE_CATEGORIES.CANVAS_OPERATIONS,
  movements: [
    {
      name: "Drag Initiation Movement",
      description: "Initiates drag operation",
      beats: [
        {
          beat: 1,
          event: "DRAG_START",
          title: "Drag Start",
          description: "Start drag operation",
          dynamics: MUSICAL_DYNAMICS.FORTE,
          timing: MUSICAL_TIMING.IMMEDIATE,
          dependencies: []
        },
        {
          beat: 2,
          event: "DRAG_VALIDATION",
          title: "Validate Drag",
          description: "Validate drag context",
          dynamics: MUSICAL_DYNAMICS.MEZZO_FORTE,
          timing: MUSICAL_TIMING.IMMEDIATE,
          dependencies: []
        }
      ]
    },
    {
      name: "Drag Execution Movement",
      description: "Executes drag operation",
      beats: [
        {
          beat: 3,
          event: "DRAG_MOVE",
          title: "Drag Move",
          description: "Process drag movement",
          dynamics: MUSICAL_DYNAMICS.FORTE,
          timing: MUSICAL_TIMING.IMMEDIATE,
          dependencies: []
        },
        {
          beat: 4,
          event: "DRAG_END",
          title: "Drag End",
          description: "Complete drag operation",
          dynamics: MUSICAL_DYNAMICS.FORTE,
          timing: MUSICAL_TIMING.IMMEDIATE,
          dependencies: []
        }
      ]
    }
  ]
};

// ✅ VALID: Sequence handlers that match movements
export const COMPONENT_DRAG_HANDLERS = {
  "Drag Initiation Movement": (data: any) => {
    console.log("🎼 Executing Drag Initiation Movement", data);
    return { success: true, message: "Drag initiated" };
  },
  
  "Drag Execution Movement": (data: any) => {
    console.log("🎼 Executing Drag Execution Movement", data);
    return { success: true, message: "Drag executed" };
  }
};

// ✅ VALID: Convenience function for triggering this sequence
export const startComponentDragFlow = (
  conductor: any,
  element: any,
  dragData: any
) => {
  return conductor.startSequence('Component Drag Symphony No. 5', {
    element,
    dragData,
    timestamp: Date.now(),
    sequenceId: `component-drag-${Date.now()}`,
    context: {
      source: 'component-drag-test',
      operation: 'drag-start',
      elementType: element?.type || 'unknown'
    }
  });
};

// ✅ VALID: Plugin registration
export const registerComponentDragPlugin = (conductor: any) => {
  console.log("🧠 Registering Component Drag Plugin");
  
  // Register the sequence
  conductor.registerSequence(COMPONENT_DRAG_SEQUENCE);
  
  // Mount as CIA plugin
  const result = conductor.mount(COMPONENT_DRAG_SEQUENCE, COMPONENT_DRAG_HANDLERS);
  
  if (result.success) {
    console.log("✅ Component Drag Plugin registered successfully");
  } else {
    console.error("❌ Failed to register Component Drag Plugin:", result.message);
  }
  
  return result;
};

// ✅ VALID: Export for external usage
export {
  COMPONENT_DRAG_SEQUENCE as sequence,
  COMPONENT_DRAG_HANDLERS as handlers
};

// Plugin metadata for CIA validation
export const PLUGIN_METADATA = {
  id: "component-drag-symphony-test",
  version: "1.0.0",
  expectedTriggers: [
    {
      file: "App.tsx",
      method: "conductor.startSequence",
      sequenceName: "Component Drag Symphony No. 5"
    },
    {
      file: "App.tsx", 
      method: "startComponentDragFlow",
      movement: "Drag Initiation Movement"
    }
  ]
};
