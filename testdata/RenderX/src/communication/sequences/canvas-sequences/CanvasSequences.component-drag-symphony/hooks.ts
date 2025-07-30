/**
 * Canvas Component Drag Symphony Hook
 *
 * 🎼 Musical Sequence Integration:
 * - Symphony: Canvas Component Drag Symphony No. 4
 * - Key: D Major (Strong and dynamic)
 * - Tempo: 140 BPM (Allegro - Fast and responsive drag operations)
 * - Time Signature: 4/4
 * - Feel: Dynamic element dragging with real-time position updates
 *
 * 🎯 Beat Mapping:
 * Beat 1: CANVAS_DRAG_VALIDATION - validateDragContext()
 * Beat 2: CANVAS_ELEMENT_MOVED - processElementDrag() [BUSINESS LOGIC]
 * Beat 3: CANVAS_DRAG_COORDINATION - coordinateDragState()
 * Beat 4: DRAG_CLEANUP - syncDragChanges()
 *
 * @param conductor - The musical conductor instance from communication system
 * @param elements - Array of canvas elements
 * @param setElements - Function to update elements array
 * @param syncElementCSS - Optional function to sync CSS changes
 * @param canvasBounds - Optional canvas boundary information
 */

import { useCallback, useEffect } from 'react';
import { eventBus, EVENT_TYPES } from '../../../EventBus';
import { CANVAS_COMPONENT_DRAG_SEQUENCE } from './sequence';
import {
    validateDragContext,
    processElementDrag,
    coordinateDragState,
    syncDragChanges,
    calculateDragPosition,
    generateHTMLFromContent
} from './business-logic';

// Types for better type safety
interface Element {
    id: string;
    type: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    [key: string]: any;
}

interface CanvasBounds {
    width: number;
    height: number;
}

export const useCanvasComponentDragSymphony = (
    conductor: any,
    elements: Element[],
    setElements: (updater: (prev: Element[]) => Element[]) => void,
    syncElementCSS?: (element: Element, cssData: any) => void,
    canvasBounds?: CanvasBounds
) => {

    // ✅ REGISTER MUSICAL SEQUENCE - Pure Musical Sequence Architecture
    useEffect(() => {
        if (!conductor) {
            console.warn('🚨 Canvas Component Drag Symphony: No conductor provided');
            return;
        }

        console.log('🎼 Registering Canvas Component Drag Musical Sequence');
        conductor.defineSequence('canvas-component-drag-symphony', CANVAS_COMPONENT_DRAG_SEQUENCE);

        return () => {
            console.log('🎼 Unregistering Canvas Component Drag Musical Sequence');
            // Note: conductor doesn't have unregister method, sequences persist for app lifetime
        };
    }, [conductor]);

    // 🎼 Beat 1: CANVAS_DRAG_VALIDATION
    const handleDragValidation = useCallback((elementId: string, changes: any, source: string): boolean => {
        console.log('🎼 Beat 1: Canvas Drag Validation');
        return validateDragContext(elementId, changes, source, elements);
    }, [elements]);

    // 🎼 Beat 2: CANVAS_ELEMENT_MOVED [BUSINESS LOGIC]
    const handleElementDrag = useCallback(async (elementId: string, changes: any, source: string): Promise<Element | null> => {
        console.log('🎼 Beat 2: Element Drag Processing');
        return await processElementDrag(elementId, changes, source, elements, setElements);
    }, [elements, setElements]);

    // 🎼 Beat 3: CANVAS_DRAG_COORDINATION
    const handleDragCoordination = useCallback((elementId: string, changes: any, source: string): boolean => {
        console.log('🎼 Beat 3: Drag State Coordination');
        return coordinateDragState(elementId, changes, source, elements);
    }, [elements]);

    // 🎼 Beat 4: DRAG_CLEANUP
    const handleDragCleanup = useCallback((elementId: string, changes: any, source: string, capturedElement: Element | null): boolean => {
        console.log('🎼 Beat 4: Drag Changes Synchronization');
        return syncDragChanges(elementId, changes, source, capturedElement, syncElementCSS);
    }, [syncElementCSS]);

    // 🎼 Symphony orchestration
    const startComponentDragSequence = useCallback((elementId: string, changes: any, source: string, eventData: any): void => {
        if (!conductor) {
            console.warn('🚨 Canvas Component Drag Symphony: No conductor available for sequence start');
            return;
        }

        console.log('🎼 Starting Canvas Component Drag Symphony No. 4');

        conductor.startSequence('canvas-component-drag-symphony', {
            elementId,
            changes,
            source,
            elements, // Include current elements array
            setElements, // Include setElements function
            syncElementCSS, // Include CSS sync function
            eventData,
            timestamp: Date.now()
        });
    }, [conductor, elements, setElements, syncElementCSS]);

    // 🎼 Unified drag operation
    const updateElementState = useCallback(async (elementId: string, changes: any, source: string): Promise<void> => {
        console.log('🎼 Canvas Component Drag Symphony No. 4: "Dynamic Movement" - Starting coordination');

        try {
            // Beat 1: Validate drag context
            if (!handleDragValidation(elementId, changes, source)) {
                throw new Error('Drag context validation failed');
            }

            // Beat 2: Process element drag (await the Promise)
            const capturedElement = await handleElementDrag(elementId, changes, source);

            // Beat 3: Coordinate drag state
            handleDragCoordination(elementId, changes, source);

            // Beat 4: Sync drag changes with captured element data
            handleDragCleanup(elementId, changes, source, capturedElement);

            // Start the musical sequence for coordination (non-blocking)
            const eventData = {
                eventType: 'canvas-element-moved',
                elementId,
                changes,
                source,
                timestamp: Date.now()
            };

            startComponentDragSequence(elementId, changes, source, eventData);

        } catch (error) {
            console.error('🎼 Canvas Component Drag Symphony No. 4 failed:', error);
        }
    }, [handleDragValidation, handleElementDrag, handleDragCoordination, handleDragCleanup, startComponentDragSequence]);

    return {
        // 🎼 Beat-mapped methods (documented with beat numbers)
        validateDragContext: handleDragValidation,        // Beat 1: CANVAS_DRAG_VALIDATION
        processElementDrag: handleElementDrag,            // Beat 2: CANVAS_ELEMENT_MOVED [BUSINESS LOGIC]
        coordinateDragState: handleDragCoordination,      // Beat 3: CANVAS_DRAG_COORDINATION
        syncDragChanges: handleDragCleanup,              // Beat 4: DRAG_CLEANUP
        
        // 🎼 Symphony orchestration
        startComponentDragSequence,
        
        // 🎼 Unified operations
        updateElementState,
        
        // 🎼 Utilities
        generateHTMLFromContent,
        calculateDragPosition
    };
};
