/**
 * Canvas Element Selection - onSelectionChange Handler
 * Beat 2: Selection Processing
 */

import { processElementSelection } from '../logic/selectionProcessing';

interface SelectionChangeData {
    element: any;
    selectionType: 'single' | 'multi' | 'range';
    currentSelection: any[];
    clearPrevious: boolean;
}

/**
 * Handle Canvas Selection Changed
 * Beat 2 handler for CANVAS_SELECTION_CHANGED
 */
export const handleCanvasSelectionChanged = (data: SelectionChangeData): any => {
    console.log('🎼 ElementSelection Handler: Canvas Selection Changed', data);

    try {
        const { element, selectionType, currentSelection, clearPrevious } = data;

        // Process the selection change
        const result = processElementSelection(element, selectionType, currentSelection, clearPrevious);
        
        if (result.success) {
            console.log('🎼 ElementSelection Handler: Selection Processing completed successfully');
            return {
                success: true,
                updatedSelection: result.updatedSelection,
                selectionType,
                element
            };
        }

        return {
            success: false,
            error: result.error || 'Selection processing failed'
        };

    } catch (error) {
        console.error('🎼 ElementSelection Handler: Canvas Selection Changed failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

export default handleCanvasSelectionChanged;
