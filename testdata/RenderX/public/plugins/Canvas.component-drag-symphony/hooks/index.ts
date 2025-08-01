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
 */

import { useCallback, useEffect } from 'react';
import { validateDragContext } from '../logic/dragValidation';
import { processElementDrag } from '../logic/dragProcessing';
import { coordinateDragState, syncDragChanges } from '../logic/dragCoordination';

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

interface UseComponentDragOptions {
    conductor: any;
    elements: Element[];
    setElements: (updater: (prev: Element[]) => Element[]) => void;
    syncElementCSS?: (element: Element, cssData: any) => void;
    canvasBounds?: CanvasBounds;
    enableGridSnap?: boolean;
    gridSize?: number;
}

/**
 * Canvas Component Drag Hook
 * Integrates with Canvas Component Drag Symphony No. 4
 */
export const useCanvasComponentDrag = ({
    conductor,
    elements,
    setElements,
    syncElementCSS,
    canvasBounds,
    enableGridSnap = false,
    gridSize = 20
}: UseComponentDragOptions) => {
    
    // Start drag sequence
    const startDragSequence = useCallback((elementId: string, eventData: any) => {
        if (!conductor) {
            console.warn('🎼 ComponentDrag Hook: Conductor not available');
            return null;
        }

        const element = elements.find(el => el.id === elementId);
        if (!element) {
            console.warn('🎼 ComponentDrag Hook: Element not found:', elementId);
            return null;
        }

        // Start the Canvas Component Drag Symphony
        return conductor.startSequence('Canvas Component Drag Symphony No. 4', {
            element,
            eventData,
            elements,
            setElements,
            syncElementCSS,
            canvasBounds,
            enableGridSnap,
            gridSize,
            timestamp: new Date(),
            sequenceId: `canvas-drag-${Date.now()}`
        });
    }, [conductor, elements, setElements, syncElementCSS, canvasBounds, enableGridSnap, gridSize]);

    // Handle drag start
    const handleDragStart = useCallback((elementId: string, startPosition: { x: number; y: number }) => {
        console.log('🎼 ComponentDrag Hook: Drag Start', { elementId, startPosition });
        
        const eventData = {
            type: 'drag-start',
            startPosition,
            timestamp: new Date()
        };

        return startDragSequence(elementId, eventData);
    }, [startDragSequence]);

    // Handle drag move
    const handleDragMove = useCallback((elementId: string, newPosition: { x: number; y: number }) => {
        console.log('🎼 ComponentDrag Hook: Drag Move', { elementId, newPosition });
        
        const element = elements.find(el => el.id === elementId);
        if (!element) return false;

        const changes = {
            x: newPosition.x,
            y: newPosition.y,
            snapToGrid: enableGridSnap,
            gridSize
        };

        return processElementDrag(elementId, changes, 'canvas-drag', elements, setElements);
    }, [elements, setElements, enableGridSnap, gridSize]);

    // Handle drag end
    const handleDragEnd = useCallback((elementId: string, finalPosition: { x: number; y: number }) => {
        console.log('🎼 ComponentDrag Hook: Drag End', { elementId, finalPosition });
        
        const element = elements.find(el => el.id === elementId);
        if (!element) return false;

        const changes = {
            x: finalPosition.x,
            y: finalPosition.y
        };

        // Coordinate final state
        const coordinated = coordinateDragState(elementId, changes, 'canvas-drag', elements);
        
        // Sync CSS changes
        if (coordinated && syncElementCSS) {
            syncDragChanges(elementId, changes, 'canvas-drag', elements, element, syncElementCSS);
        }

        return coordinated;
    }, [elements, syncElementCSS]);

    // Validate if element can be dragged
    const canDragElement = useCallback((elementId: string) => {
        const element = elements.find(el => el.id === elementId);
        if (!element) return false;

        return validateDragContext(elementId, {}, 'canvas-drag', elements);
    }, [elements]);

    return {
        startDragSequence,
        handleDragStart,
        handleDragMove,
        handleDragEnd,
        canDragElement
    };
};

export default useCanvasComponentDrag;
