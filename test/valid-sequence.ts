/**
 * Valid sequence file for testing context-aware validation
 * This file should allow conductor.executeBeat() calls
 */

export const CanvasDragSequence = {
  name: 'Canvas Drag Symphony No. 1',
  description: 'Orchestrates canvas drag interactions with smooth visual feedback',
  key: 'C Major',
  tempo: 120,
  timeSignature: '4/4',
  movements: [
    {
      name: 'Drag Initiation',
      beats: [
        {
          number: 1,
          eventType: 'DRAG_START',
          handler: (data) => {
            // ✅ Valid: conductor.executeBeat() in sequence context
            conductor.executeBeat({
              eventType: 'VISUAL_FEEDBACK_START',
              data: { x: data.x, y: data.y }
            });
          }
        },
        {
          number: 2,
          eventType: 'DRAG_MOVE',
          handler: (data) => {
            // ✅ Valid: conductor.executeBeat() in sequence beat definition
            conductor.executeBeat({
              eventType: 'UPDATE_POSITION',
              data: { deltaX: data.deltaX, deltaY: data.deltaY }
            });
          }
        }
      ]
    },
    {
      name: 'Drag Completion',
      beats: [
        {
          number: 3,
          eventType: 'DRAG_END',
          handler: (data) => {
            // ✅ Valid: conductor.executeBeat() within sequence definition
            conductor.executeBeat({
              eventType: 'VISUAL_FEEDBACK_END',
              data: { finalX: data.x, finalY: data.y }
            });
          }
        }
      ]
    }
  ]
};

// ✅ Valid: MusicalSequences API usage
export function startCanvasDragFlow(initialData) {
  return MusicalSequences.startCanvasDragFlow(initialData);
}

// ✅ Valid: eventBus subscription pattern
export function setupCanvasDragListeners() {
  const unsubscribe1 = eventBus.subscribe('canvas-drag-start', handleDragStart);
  const unsubscribe2 = eventBus.subscribe('canvas-drag-move', handleDragMove);
  const unsubscribe3 = eventBus.subscribe('canvas-drag-end', handleDragEnd);
  
  return () => {
    unsubscribe1();
    unsubscribe2();
    unsubscribe3();
  };
}

function handleDragStart(data) {
  // ✅ Valid: Using MusicalSequences API
  MusicalSequences.startCanvasDragFlow(data);
}

function handleDragMove(data) {
  // ✅ Valid: No direct eventBus.emit() calls
  updateCanvasPosition(data);
}

function handleDragEnd(data) {
  // ✅ Valid: Proper sequence completion
  MusicalSequences.completeCanvasDragFlow(data);
}
