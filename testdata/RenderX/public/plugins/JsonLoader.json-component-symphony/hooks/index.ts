/**
 * JSON Component Loading Symphony Hook
 */

import { useCallback } from 'react';

interface UseJsonLoaderOptions {
    conductor: any;
    onLoadComplete?: (components: any[]) => void;
    onLoadError?: (error: any) => void;
}

export const useJsonComponentLoader = ({ conductor, onLoadComplete, onLoadError }: UseJsonLoaderOptions) => {
    
    const startLoadingSequence = useCallback((componentFiles: any[]) => {
        if (!conductor) {
            console.warn('🎼 JsonLoader Hook: Conductor not available');
            return null;
        }

        return conductor.startSequence('JSON Component Loading Symphony No. 1', {
            componentFiles,
            timestamp: new Date(),
            sequenceId: `json-loading-${Date.now()}`
        });
    }, [conductor]);

    const loadComponents = useCallback((componentFiles: any[]) => {
        console.log('🎼 JsonLoader Hook: Load Components', { count: componentFiles.length });
        
        const sequenceId = startLoadingSequence(componentFiles);
        
        // Simulate loading
        setTimeout(() => {
            if (onLoadComplete) {
                onLoadComplete(componentFiles);
            }
        }, 100);
        
        return sequenceId;
    }, [startLoadingSequence, onLoadComplete]);

    return {
        startLoadingSequence,
        loadComponents
    };
};

export default useJsonComponentLoader;
