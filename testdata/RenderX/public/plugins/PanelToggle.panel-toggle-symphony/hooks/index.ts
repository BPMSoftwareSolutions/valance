/**
 * Panel Toggle Symphony Hook
 */

import { useCallback } from 'react';

interface UsePanelToggleOptions {
    conductor: any;
    onPanelToggled?: (panelType: string, newState: boolean) => void;
}

export const usePanelToggle = ({ conductor, onPanelToggled }: UsePanelToggleOptions) => {
    
    const startPanelToggleSequence = useCallback((panelType: string, newState: boolean, options: any = {}) => {
        if (!conductor) {
            console.warn('🎼 PanelToggle Hook: Conductor not available');
            return null;
        }

        return conductor.startSequence('Panel Toggle Symphony No. 1', {
            panelType,
            newState,
            options,
            timestamp: new Date(),
            sequenceId: `panel-toggle-${Date.now()}`
        });
    }, [conductor]);

    const togglePanel = useCallback((panelType: string, newState: boolean, options: any = {}) => {
        console.log('🎼 PanelToggle Hook: Toggle Panel', { panelType, newState });
        
        const sequenceId = startPanelToggleSequence(panelType, newState, options);
        
        if (sequenceId && onPanelToggled) {
            onPanelToggled(panelType, newState);
        }
        
        return sequenceId;
    }, [startPanelToggleSequence, onPanelToggled]);

    return {
        startPanelToggleSequence,
        togglePanel
    };
};

export default usePanelToggle;
