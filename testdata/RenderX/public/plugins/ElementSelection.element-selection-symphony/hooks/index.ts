/**
 * Canvas Element Selection Symphony Hook
 * Integrates with Canvas Element Selection Symphony No. 37
 */

import { useCallback } from 'react';
import { validateSelectionContext } from '../logic/selectionValidation';
import { processElementSelection } from '../logic/selectionProcessing';
import { updateSelectionVisuals, syncSelectionState } from '../logic/selectionCoordination';

interface Element {
    id: string;
    type: string;
    [key: string]: any;
}

interface UseElementSelectionOptions {
    conductor: any;
    currentSelection: Element[];
    setSelection: (selection: Element[]) => void;
    visualFeedback?: boolean;
    updateHistory?: boolean;
}

/**
 * Canvas Element Selection Hook
 * Integrates with Canvas Element Selection Symphony No. 37
 */
export const useCanvasElementSelection = ({
    conductor,
    currentSelection,
    setSelection,
    visualFeedback = true,
    updateHistory = true
}: UseElementSelectionOptions) => {
    
    // Start selection sequence
    const startSelectionSequence = useCallback((element: Element, selectionType: 'single' | 'multi' | 'range' = 'single') => {
        if (!conductor) {
            console.warn('🎼 ElementSelection Hook: Conductor not available');
            return null;
        }

        return conductor.startSequence('Canvas Element Selection Symphony No. 37', {
            element,
            selectionType,
            currentSelection,
            visualFeedback,
            updateHistory,
            timestamp: new Date(),
            sequenceId: `canvas-selection-${Date.now()}`
        });
    }, [conductor, currentSelection, visualFeedback, updateHistory]);

    // Handle element selection
    const selectElement = useCallback((element: Element, selectionType: 'single' | 'multi' | 'range' = 'single') => {
        console.log('🎼 ElementSelection Hook: Select Element', { element: element.id, selectionType });
        
        // Validate selection
        if (!validateSelectionContext(element, undefined, selectionType)) {
            console.warn('🎼 ElementSelection Hook: Selection validation failed');
            return false;
        }

        // Process selection
        const result = processElementSelection(element, selectionType, currentSelection, selectionType === 'single');
        
        if (result.success) {
            setSelection(result.updatedSelection);
            
            // Update visuals if enabled
            if (visualFeedback) {
                updateSelectionVisuals(element, result.updatedSelection);
            }
            
            // Sync state if enabled
            if (updateHistory) {
                syncSelectionState(element, result.updatedSelection, true);
            }
            
            // Start sequence
            startSelectionSequence(element, selectionType);
            
            return true;
        }

        return false;
    }, [currentSelection, setSelection, visualFeedback, updateHistory, startSelectionSequence]);

    // Clear selection
    const clearSelection = useCallback(() => {
        console.log('🎼 ElementSelection Hook: Clear Selection');
        setSelection([]);
        
        if (visualFeedback) {
            // Clear visual indicators
            console.log('🎼 ElementSelection Hook: Clearing selection visuals');
        }
    }, [setSelection, visualFeedback]);

    return {
        selectElement,
        clearSelection,
        startSelectionSequence,
        currentSelection
    };
};

export default useCanvasElementSelection;
