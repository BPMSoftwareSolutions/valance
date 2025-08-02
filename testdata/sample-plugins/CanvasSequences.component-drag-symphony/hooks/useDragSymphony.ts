// @agent-context: hook for orchestrating drag symphony playback during canvas operations
import { useCallback, useRef } from 'react';

interface DragSymphonyHookReturn {
  startDragSymphony: (elementId: string) => void;
  updateDragSymphony: (elementId: string, position: { x: number; y: number }) => void;
  endDragSymphony: (elementId: string) => void;
  isDragActive: boolean;
}

/**
 * Hook for orchestrating drag symphony playback
 * Manages the musical flow during canvas drag operations
 */
export const useDragSymphony = (): DragSymphonyHookReturn => {
  const dragStateRef = useRef<{
    activeElement: string | null;
    startTime: number | null;
    lastUpdate: number | null;
  }>({
    activeElement: null,
    startTime: null,
    lastUpdate: null
  });

  const startDragSymphony = useCallback((elementId: string) => {
    console.log('🎼 Starting drag symphony for element:', elementId);
    
    dragStateRef.current = {
      activeElement: elementId,
      startTime: Date.now(),
      lastUpdate: Date.now()
    };

    // In a real implementation, this would trigger audio/visual feedback
    // For now, we'll just log the symphony start
    console.log('🎼 Drag symphony started - Movement 1: DragStart');
  }, []);

  const updateDragSymphony = useCallback((elementId: string, position: { x: number; y: number }) => {
    if (dragStateRef.current.activeElement !== elementId) {
      return;
    }

    const now = Date.now();
    const timeSinceStart = now - (dragStateRef.current.startTime || now);
    const timeSinceLastUpdate = now - (dragStateRef.current.lastUpdate || now);

    // Throttle updates to avoid overwhelming the system
    if (timeSinceLastUpdate < 16) { // ~60fps
      return;
    }

    dragStateRef.current.lastUpdate = now;

    // Determine which movement we're in based on time and position
    let movement = 'ElementMoved';
    if (timeSinceStart > 500) {
      movement = 'DropValidation';
    }

    console.log(`🎼 Drag symphony update - Movement: ${movement}, Position:`, position);
  }, []);

  const endDragSymphony = useCallback((elementId: string) => {
    if (dragStateRef.current.activeElement !== elementId) {
      return;
    }

    console.log('🎼 Ending drag symphony for element:', elementId);
    console.log('🎼 Drag symphony ended - Movement 4: Drop');

    dragStateRef.current = {
      activeElement: null,
      startTime: null,
      lastUpdate: null
    };
  }, []);

  const isDragActive = dragStateRef.current.activeElement !== null;

  return {
    startDragSymphony,
    updateDragSymphony,
    endDragSymphony,
    isDragActive
  };
};
