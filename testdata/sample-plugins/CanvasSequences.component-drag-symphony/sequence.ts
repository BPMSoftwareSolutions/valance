// @agent-context: sequence definition for Canvas Component Drag Symphony No. 4 - Dynamic Movement
export const sequence = {
  id: 'canvas-component-drag-symphony',
  version: '1.0.0',
  key: 'D Minor',
  tempo: 140,
  movements: [
    { 
      label: 'DragStart', 
      startBeat: 0, 
      durationInBeats: 1, 
      mood: 'anticipation',
      description: 'Initiates canvas drag operation and prepares element for movement'
    },
    { 
      label: 'ElementMoved', 
      startBeat: 1, 
      durationInBeats: 1, 
      mood: 'focus',
      description: 'Processes element movement with real-time position updates'
    },
    { 
      label: 'DropValidation', 
      startBeat: 2, 
      durationInBeats: 1, 
      mood: 'focus',
      description: 'Validates drag position and checks for valid drop zones'
    },
    { 
      label: 'Drop', 
      startBeat: 3, 
      durationInBeats: 1, 
      mood: 'celebration',
      description: 'Completes drag operation and finalizes element position'
    }
  ],
  metadata: {
    name: "Canvas Component Drag Symphony No. 4",
    description: "Dynamic Movement - Dynamic drag operation flow",
    timeSignature: "4/4",
    category: "canvas-operations",
    feel: "Dynamic element dragging with real-time position updates"
  }
};
