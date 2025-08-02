// @agent-context: hook for beat synchronization during drag operations
import { useCallback, useRef, useEffect } from 'react';

interface BeatTrackerHookReturn {
  getCurrentBeat: () => number;
  resetBeat: () => void;
  getBeatDuration: () => number;
  isOnBeat: (tolerance?: number) => boolean;
}

/**
 * Hook for tracking musical beats during drag operations
 * Provides beat synchronization for the drag symphony
 */
export const useBeatTracker = (tempo: number = 140): BeatTrackerHookReturn => {
  const beatStateRef = useRef<{
    startTime: number | null;
    tempo: number;
  }>({
    startTime: null,
    tempo
  });

  // Update tempo when it changes
  useEffect(() => {
    beatStateRef.current.tempo = tempo;
  }, [tempo]);

  const getCurrentBeat = useCallback((): number => {
    if (!beatStateRef.current.startTime) {
      return 0;
    }

    const now = Date.now();
    const elapsed = now - beatStateRef.current.startTime;
    const beatDuration = getBeatDuration();
    
    return Math.floor(elapsed / beatDuration);
  }, []);

  const resetBeat = useCallback(() => {
    beatStateRef.current.startTime = Date.now();
    console.log('🎵 Beat tracker reset');
  }, []);

  const getBeatDuration = useCallback((): number => {
    // Calculate beat duration in milliseconds
    // 60,000 ms per minute / tempo (beats per minute) = ms per beat
    return 60000 / beatStateRef.current.tempo;
  }, []);

  const isOnBeat = useCallback((tolerance: number = 50): boolean => {
    if (!beatStateRef.current.startTime) {
      return false;
    }

    const now = Date.now();
    const elapsed = now - beatStateRef.current.startTime;
    const beatDuration = getBeatDuration();
    const beatPosition = elapsed % beatDuration;
    
    // Check if we're within tolerance of a beat
    return beatPosition < tolerance || beatPosition > (beatDuration - tolerance);
  }, [getBeatDuration]);

  return {
    getCurrentBeat,
    resetBeat,
    getBeatDuration,
    isOnBeat
  };
};
