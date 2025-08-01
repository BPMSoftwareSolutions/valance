/**
 * Canvas Library Drop - onLibraryDragStart Handler
 * Beat 1: Library Drag Initiation
 */

import { validateDropContext } from '../logic/dropValidation';

interface LibraryDragStartData {
    dragData: any;
    dropCoordinates: { x: number; y: number };
    containerContext?: any;
    libraryElement: any;
}

/**
 * Handle Library Drag Start
 * Beat 1 handler for LIBRARY_DRAG_START
 */
export const handleLibraryDragStart = (data: LibraryDragStartData): any => {
    console.log('🎼 LibraryDrop Handler: Library Drag Start', data);

    try {
        const { dragData, dropCoordinates, containerContext, libraryElement } = data;

        // Validate drag data
        if (!dragData || !dragData.type || !dragData.componentId) {
            console.error('🎼 LibraryDrop Handler: Invalid drag data for library drop:', dragData);
            return {
                success: false,
                error: 'Invalid drag data',
                validation: {
                    dragData: false,
                    dropCoordinates: !!dropCoordinates,
                    containerContext: !!containerContext
                }
            };
        }

        // Validate drop coordinates
        if (!dropCoordinates || typeof dropCoordinates.x !== 'number' || typeof dropCoordinates.y !== 'number') {
            console.error('🎼 LibraryDrop Handler: Invalid drop coordinates for library drop:', dropCoordinates);
            return {
                success: false,
                error: 'Invalid drop coordinates',
                validation: {
                    dragData: true,
                    dropCoordinates: false,
                    containerContext: !!containerContext
                }
            };
        }

        // Use validation logic
        const result = validateDropContext(dragData, dropCoordinates, containerContext);
        
        if (result) {
            console.log('🎼 LibraryDrop Handler: Library Drag Start completed successfully');
            return {
                success: true,
                dragData,
                dropCoordinates,
                containerContext,
                libraryElement,
                validation: {
                    dragData: true,
                    dropCoordinates: true,
                    containerContext: !!containerContext
                }
            };
        }

        return {
            success: false,
            error: 'Drop context validation failed'
        };

    } catch (error) {
        console.error('🎼 LibraryDrop Handler: Library Drag Start failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

export default handleLibraryDragStart;
