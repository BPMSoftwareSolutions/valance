/**
 * Canvas Library Drop Symphony - React Hooks
 * 
 * React hooks for the Canvas Library Drop Symphony No. 33.
 * Provides React integration for library drop operations.
 * 
 * @version 1.0.0
 * @author RenderX Evolution Team
 * @date 2025-07-29
 */

import { useCallback, useEffect, useRef } from 'react';
import { startCanvasLibraryDropFlow, CANVAS_LIBRARY_DROP_SEQUENCE } from './sequence';

/**
 * Hook for Canvas Library Drop Symphony integration
 * 
 * Provides React integration for the Canvas Library Drop Symphony,
 * managing drop operations and state synchronization.
 * 
 * @param conductor - The musical conductor instance
 * @param options - Configuration options for the hook
 * @returns Hook interface for library drop operations
 */
export const useCanvasLibraryDropSymphony = (
  conductor: any,
  options: {
    autoCleanup?: boolean;
    validateDropZone?: boolean;
    enableMultiDrop?: boolean;
  } = {}
) => {
  const activeSequenceRef = useRef<string | null>(null);

  // ✅ REGISTER MUSICAL SEQUENCE - Pure Musical Sequence Architecture
  useEffect(() => {
    if (!conductor) {
      console.warn('🚨 Canvas Library Drop Symphony: No conductor provided');
      return;
    }

    console.log('🎼 Registering Canvas Library Drop Musical Sequence');
    conductor.registerSequence(CANVAS_LIBRARY_DROP_SEQUENCE);

    return () => {
      console.log('🎼 Unregistering Canvas Library Drop Musical Sequence');
      // Note: conductor doesn't have unregister method, sequences persist for app lifetime
    };
  }, [conductor]);
  const dropStateRef = useRef<{
    isDragging: boolean;
    dragData: any;
    dropCoordinates: any;
  }>({
    isDragging: false,
    dragData: null,
    dropCoordinates: null
  });

  /**
   * Handle library drop operation
   * Initiates the Canvas Library Drop Symphony
   */
  const handleLibraryDrop = useCallback((
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
    containerContext?: {
      containerId?: string;
      containerType?: string;
      isValidDropZone: boolean;
    }
  ) => {
    if (!conductor) {
      console.warn('Canvas Library Drop Symphony: No conductor available');
      return null;
    }

    // Validate drop zone if enabled
    if (options.validateDropZone && containerContext && !containerContext.isValidDropZone) {
      console.warn('Canvas Library Drop Symphony: Invalid drop zone');
      return null;
    }

    // Start the library drop sequence
    const sequenceId = startCanvasLibraryDropFlow(
      conductor,
      dragData,
      dropCoordinates,
      containerContext,
      {
        timestamp: Date.now(),
        source: 'react-hook'
      }
    );

    activeSequenceRef.current = sequenceId;
    
    // Update drop state
    dropStateRef.current = {
      isDragging: false,
      dragData,
      dropCoordinates
    };

    return sequenceId;
  }, [conductor, options.validateDropZone]);

  /**
   * Handle drag start
   * Updates internal state when drag starts
   */
  const handleDragStart = useCallback((dragData: any) => {
    dropStateRef.current = {
      isDragging: true,
      dragData,
      dropCoordinates: null
    };
  }, []);

  /**
   * Handle drag end
   * Cleans up drag state when drag ends without drop
   */
  const handleDragEnd = useCallback(() => {
    dropStateRef.current = {
      isDragging: false,
      dragData: null,
      dropCoordinates: null
    };
  }, []);

  /**
   * Get current drop state
   */
  const getDropState = useCallback(() => {
    return { ...dropStateRef.current };
  }, []);

  /**
   * Check if a sequence is currently active
   */
  const isSequenceActive = useCallback(() => {
    return activeSequenceRef.current !== null;
  }, []);

  /**
   * Cancel active sequence
   */
  const cancelActiveSequence = useCallback(() => {
    if (activeSequenceRef.current && conductor) {
      // Note: This would require conductor.cancelSequence method
      console.log(`Cancelling Canvas Library Drop sequence: ${activeSequenceRef.current}`);
      activeSequenceRef.current = null;
    }
  }, [conductor]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (options.autoCleanup !== false) {
        cancelActiveSequence();
      }
    };
  }, [cancelActiveSequence, options.autoCleanup]);

  return {
    // Main operations
    handleLibraryDrop,
    handleDragStart,
    handleDragEnd,
    
    // State queries
    getDropState,
    isSequenceActive,
    
    // Control
    cancelActiveSequence,
    
    // State
    isDragging: dropStateRef.current.isDragging,
    activeSequenceId: activeSequenceRef.current
  };
};
