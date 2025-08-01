/**
 * Canvas Element Selection - Processing Logic
 * Beat 2: Selection Processing
 */

interface Element {
  id: string;
  type: string;
  [key: string]: any;
}

/**
 * Process Element Selection
 * Beat: 2 - CANVAS_SELECTION_CHANGED
 */
export const processElementSelection = (
    element: Element, 
    selectionType: 'single' | 'multi' | 'range', 
    currentSelection: Element[], 
    clearPrevious: boolean
): { success: boolean; updatedSelection: Element[]; error?: string } => {
    console.log('🎯 ElementSelection Logic: Process Element Selection');
    
    try {
        let updatedSelection = [...currentSelection];

        if (clearPrevious || selectionType === 'single') {
            updatedSelection = [element];
        } else if (selectionType === 'multi') {
            // Toggle selection for multi-select
            const existingIndex = updatedSelection.findIndex(el => el.id === element.id);
            if (existingIndex >= 0) {
                updatedSelection.splice(existingIndex, 1);
            } else {
                updatedSelection.push(element);
            }
        } else if (selectionType === 'range') {
            // Range selection logic would go here
            updatedSelection.push(element);
        }

        console.log('🎯 ElementSelection Logic: Element selection processing successful');
        return {
            success: true,
            updatedSelection
        };

    } catch (error) {
        console.error('🎯 ElementSelection Logic: Element selection processing failed:', error);
        return {
            success: false,
            updatedSelection: currentSelection,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};
