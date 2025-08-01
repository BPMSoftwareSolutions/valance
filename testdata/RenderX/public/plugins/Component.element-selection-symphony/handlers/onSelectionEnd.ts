/**
 * Canvas Element Selection - onSelectionEnd Handler
 * Beat 3 & 4: Visual Feedback & State Management
 */

import { updateSelectionVisuals, syncSelectionState } from '../logic/selectionCoordination';

interface SelectionEndData {
    element: any;
    updatedSelection: any[];
    visualFeedback: boolean;
    updateHistory: boolean;
}

/**
 * Handle Canvas Selection Visual Update
 * Beat 3 handler for CANVAS_SELECTION_VISUAL_UPDATE
 */
export const handleCanvasSelectionVisualUpdate = (data: SelectionEndData): any => {
    console.log('🎼 ElementSelection Handler: Canvas Selection Visual Update', data);

    try {
        const { element, updatedSelection, visualFeedback = true } = data;

        if (!visualFeedback) {
            return { success: true, skipped: true };
        }

        const result = updateSelectionVisuals(element, updatedSelection);
        
        if (result) {
            console.log('🎼 ElementSelection Handler: Visual Feedback Coordination completed successfully');
            return {
                success: true,
                visualsUpdated: true,
                element,
                updatedSelection
            };
        }

        return {
            success: false,
            error: 'Visual update failed'
        };

    } catch (error) {
        console.error('🎼 ElementSelection Handler: Canvas Selection Visual Update failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

/**
 * Handle Canvas Selection State Sync
 * Beat 4 handler for CANVAS_SELECTION_STATE_SYNC
 */
export const handleCanvasSelectionStateSync = (data: SelectionEndData): any => {
    console.log('🎼 ElementSelection Handler: Canvas Selection State Sync', data);

    try {
        const { element, updatedSelection, updateHistory = true } = data;

        const result = syncSelectionState(element, updatedSelection, updateHistory);
        
        if (result) {
            console.log('🎼 ElementSelection Handler: Selection State Management completed successfully');
            return {
                success: true,
                stateSynced: true,
                element,
                updatedSelection
            };
        }

        return {
            success: false,
            error: 'State sync failed'
        };

    } catch (error) {
        console.error('🎼 ElementSelection Handler: Canvas Selection State Sync failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

export { handleCanvasSelectionVisualUpdate as default };
