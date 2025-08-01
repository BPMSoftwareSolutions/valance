/**
 * Canvas Element Selection - onSelectionStart Handler
 * Beat 1: Element Selection Detection
 */

import { validateSelectionContext } from '../logic/selectionValidation';

interface SelectionStartData {
    element: any;
    selectionContext?: any;
    selectionType?: 'single' | 'multi' | 'range';
    clearPrevious?: boolean;
}

/**
 * Handle Canvas Element Selected
 * Beat 1 handler for CANVAS_ELEMENT_SELECTED
 */
export const handleCanvasElementSelected = (data: SelectionStartData): any => {
    console.log('🎼 ElementSelection Handler: Canvas Element Selected', data);

    try {
        const { element, selectionContext, selectionType = 'single', clearPrevious = true } = data;

        // Validate element data
        if (!element || !element.id || !element.type) {
            console.error('🎼 ElementSelection Handler: Invalid element data for selection:', element);
            return {
                success: false,
                error: 'Invalid element data',
                validation: {
                    element: false,
                    selectionContext: !!selectionContext
                }
            };
        }

        // Validate selection permissions
        const hasSelectionPermission = element.metadata?.selectable !== false;
        if (!hasSelectionPermission) {
            console.warn('🎼 ElementSelection Handler: Element is not selectable:', element.id);
            return {
                success: false,
                error: 'Element is not selectable',
                validation: {
                    element: true,
                    selectionContext: !!selectionContext,
                    selectable: false
                }
            };
        }

        // Use validation logic
        const result = validateSelectionContext(element, selectionContext, selectionType);
        
        if (result) {
            console.log('🎼 ElementSelection Handler: Element Selection Detection completed successfully');
            return {
                success: true,
                element,
                selectionType,
                clearPrevious,
                validation: {
                    element: true,
                    selectionContext: !!selectionContext,
                    selectable: true
                }
            };
        }

        return {
            success: false,
            error: 'Selection validation failed'
        };

    } catch (error) {
        console.error('🎼 ElementSelection Handler: Canvas Element Selected failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

export default handleCanvasElementSelected;
