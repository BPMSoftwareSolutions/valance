/**
 * Canvas Element Selection Symphony - React Hooks
 * 
 * React hooks for the Canvas Element Selection Symphony No. 37.
 * Provides React integration for element selection operations.
 * 
 * @version 1.0.0
 * @author RenderX Evolution Team
 * @date 2025-07-29
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { startCanvasElementSelectionFlow, CANVAS_ELEMENT_SELECTION_SEQUENCE } from './sequence';

/**
 * Hook for Canvas Element Selection Symphony integration
 * 
 * Provides React integration for the Canvas Element Selection Symphony,
 * managing selection operations and state synchronization.
 * 
 * @param conductor - The musical conductor instance
 * @param options - Configuration options for the hook
 * @returns Hook interface for element selection operations
 */
export const useCanvasElementSelectionSymphony = (
  conductor: any,
  options: {
    autoCleanup?: boolean;
    enableMultiSelect?: boolean;
    enableKeyboardSelection?: boolean;
  } = {}
) => {
  const activeSequenceRef = useRef<string | null>(null);
  const [selectedElements, setSelectedElements] = useState<Set<string>>(new Set());
  const [selectionState, setSelectionState] = useState<{
    isSelecting: boolean;
    lastSelected: string | null;
    selectionMode: 'single' | 'multi' | 'range';
  }>({
    isSelecting: false,
    lastSelected: null,
    selectionMode: 'single'
  });

  // ✅ REGISTER MUSICAL SEQUENCE - Pure Musical Sequence Architecture
  useEffect(() => {
    if (!conductor) {
      console.warn('🚨 Canvas Element Selection Symphony: No conductor provided');
      return;
    }

    console.log('🎼 Registering Canvas Element Selection Musical Sequence');
    conductor.defineSequence('canvas-element-selection-symphony', CANVAS_ELEMENT_SELECTION_SEQUENCE);

    return () => {
      console.log('🎼 Unregistering Canvas Element Selection Musical Sequence');
      // Note: conductor doesn't have unregister method, sequences persist for app lifetime
    };
  }, [conductor]);

  /**
   * Handle element selection operation
   * Initiates the Canvas Element Selection Symphony
   */
  const handleElementSelection = useCallback((
    element: {
      id: string;
      type: string;
      metadata?: Record<string, any>;
    },
    selectionContext?: {
      selectionType?: 'single' | 'multi' | 'range';
      clearPrevious?: boolean;
      source?: 'click' | 'keyboard' | 'programmatic';
      modifiers?: {
        ctrl?: boolean;
        shift?: boolean;
        alt?: boolean;
      };
    },
    eventData?: Record<string, any>
  ) => {
    if (!conductor) {
      console.warn('Canvas Element Selection Symphony: No conductor available');
      return null;
    }

    // Determine selection type based on modifiers and options
    let selectionType: 'single' | 'multi' | 'range' = 'single';
    let clearPrevious = true;

    if (options.enableMultiSelect && selectionContext?.modifiers?.ctrl) {
      selectionType = 'multi';
      clearPrevious = false;
    } else if (options.enableMultiSelect && selectionContext?.modifiers?.shift) {
      selectionType = 'range';
      clearPrevious = false;
    }

    const finalSelectionContext = {
      selectionType,
      clearPrevious,
      source: 'click',
      ...selectionContext
    };

    // Start the element selection sequence
    const sequenceId = startCanvasElementSelectionFlow(
      conductor,
      element,
      finalSelectionContext,
      {
        timestamp: Date.now(),
        source: 'react-hook',
        ...eventData
      }
    );

    activeSequenceRef.current = sequenceId;
    
    // Update selection state
    setSelectionState(prev => ({
      ...prev,
      isSelecting: true,
      lastSelected: element.id,
      selectionMode: selectionType
    }));

    // Update selected elements
    setSelectedElements(prev => {
      const newSelection = new Set(clearPrevious ? [] : prev);
      
      if (selectionType === 'multi') {
        if (newSelection.has(element.id)) {
          newSelection.delete(element.id);
        } else {
          newSelection.add(element.id);
        }
      } else {
        newSelection.clear();
        newSelection.add(element.id);
      }
      
      return newSelection;
    });

    return sequenceId;
  }, [conductor, options.enableMultiSelect]);

  /**
   * Clear all selections
   */
  const clearSelection = useCallback(() => {
    setSelectedElements(new Set());
    setSelectionState(prev => ({
      ...prev,
      lastSelected: null,
      selectionMode: 'single'
    }));
  }, []);

  /**
   * Select multiple elements
   */
  const selectMultipleElements = useCallback((elementIds: string[]) => {
    if (!options.enableMultiSelect) {
      console.warn('Multi-select is not enabled');
      return;
    }

    setSelectedElements(new Set(elementIds));
    setSelectionState(prev => ({
      ...prev,
      selectionMode: 'multi',
      lastSelected: elementIds[elementIds.length - 1] || null
    }));
  }, [options.enableMultiSelect]);

  /**
   * Check if an element is selected
   */
  const isElementSelected = useCallback((elementId: string): boolean => {
    return selectedElements.has(elementId);
  }, [selectedElements]);

  /**
   * Get all selected element IDs
   */
  const getSelectedElements = useCallback((): string[] => {
    return Array.from(selectedElements);
  }, [selectedElements]);

  /**
   * Get selection count
   */
  const getSelectionCount = useCallback((): number => {
    return selectedElements.size;
  }, [selectedElements]);

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
      console.log(`Cancelling Canvas Element Selection sequence: ${activeSequenceRef.current}`);
      activeSequenceRef.current = null;
    }
    
    setSelectionState(prev => ({
      ...prev,
      isSelecting: false
    }));
  }, [conductor]);

  // Handle keyboard selection if enabled
  useEffect(() => {
    if (!options.enableKeyboardSelection) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Escape key to clear selection
      if (event.key === 'Escape') {
        clearSelection();
      }
      
      // Handle Ctrl+A to select all (would need additional logic)
      if (event.key === 'a' && event.ctrlKey) {
        event.preventDefault();
        // This would require access to all canvas elements
        console.log('Select all requested (not implemented)');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [options.enableKeyboardSelection, clearSelection]);

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
    handleElementSelection,
    clearSelection,
    selectMultipleElements,
    
    // State queries
    isElementSelected,
    getSelectedElements,
    getSelectionCount,
    isSequenceActive,
    
    // Control
    cancelActiveSequence,
    
    // State
    selectedElements: Array.from(selectedElements),
    selectionState,
    activeSequenceId: activeSequenceRef.current
  };
};
