// @agent-context: entry point for Canvas Component Drag Symphony plugin registration
import { registerSequence } from '@/registry';
import { sequence } from './sequence';

// Import handlers
import { onDragStart } from './handlers/onDragStart';
import { onElementMoved } from './handlers/onElementMoved';
import { onDropValidation } from './handlers/onDropValidation';
import { onDrop } from './handlers/onDrop';

// Import hooks
import { useDragSymphony } from './hooks/useDragSymphony';
import { useBeatTracker } from './hooks/useBeatTracker';

// Registry function imported from @/registry

// Register the sequence with its handlers
registerSequence(sequence, {
  onDragStart,
  onElementMoved,
  onDropValidation,
  onDrop
});

// Export for external use
export {
  sequence,
  onDragStart,
  onElementMoved,
  onDropValidation,
  onDrop,
  useDragSymphony,
  useBeatTracker
};

console.log('🎼 Canvas Component Drag Symphony plugin loaded successfully');
