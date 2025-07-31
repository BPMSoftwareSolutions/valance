/**
 * Panel Toggle Musical Sequence
 * 
 * Handles panel toggle operations (Element Library, Control Panel) through proper musical sequence architecture.
 * Replaces direct event emissions with orchestrated sequence beats.
 * 
 * Following the anti-pattern resolution strategy from:
 * tools/docs/01-ARCHITECTURE/01-arch-canvas-anti-pattern-resolution-implementation-strategy.md
 */

import type {
  MusicalSequence
} from '../SequenceTypes';
import {
  SEQUENCE_CATEGORIES,
  MUSICAL_DYNAMICS,
  MUSICAL_TIMING
} from '../SequenceTypes';
import { LAYOUT_EVENT_TYPES, ELEMENT_LIBRARY_EVENT_TYPES, CONTROL_PANEL_EVENT_TYPES } from '../../event-types';

/**
 * Panel Toggle Symphony No. 1
 * Complete musical sequence for toggling UI panels (Element Library, Control Panel)
 */
export const PANEL_TOGGLE_SEQUENCE: MusicalSequence = {
  name: "Panel Toggle Symphony No. 1",
  description: "Orchestrates panel toggle operations through musical sequence beats",
  key: "F Major",
  tempo: 140,
  timeSignature: "4/4",
  category: SEQUENCE_CATEGORIES.USER_INTERACTIONS,
  movements: [
    {
      name: "Panel State Change Movement",
      description: "Handles the core panel state change operation",
      beats: [
        {
          beat: 1,
          event: LAYOUT_EVENT_TYPES.PANEL_TOGGLED,
          title: "Panel Toggle Initiated",
          description: "Initiates the panel toggle operation with state change",
          dynamics: MUSICAL_DYNAMICS.FORTE,
          timing: MUSICAL_TIMING.IMMEDIATE,
          data: {
            phase: 'state-change',
            operation: 'panel-toggle'
          },
          errorHandling: 'continue'
        },
        {
          beat: 2,
          event: LAYOUT_EVENT_TYPES.PANEL_OPENED,
          title: "Panel Opened",
          description: "Handles panel opening animation and state update",
          dynamics: MUSICAL_DYNAMICS.MEZZO_FORTE,
          timing: MUSICAL_TIMING.AFTER_BEAT,
          data: {
            phase: 'opening',
            operation: 'panel-show'
          },
          dependencies: [LAYOUT_EVENT_TYPES.PANEL_TOGGLED],
          errorHandling: 'continue'
        },
        {
          beat: 3,
          event: LAYOUT_EVENT_TYPES.PANEL_CLOSED,
          title: "Panel Closed",
          description: "Handles panel closing animation and state update",
          dynamics: MUSICAL_DYNAMICS.MEZZO_FORTE,
          timing: MUSICAL_TIMING.AFTER_BEAT,
          data: {
            phase: 'closing',
            operation: 'panel-hide'
          },
          dependencies: [LAYOUT_EVENT_TYPES.PANEL_TOGGLED],
          errorHandling: 'continue'
        }
      ]
    },
    {
      name: "Panel Content Update Movement",
      description: "Updates panel content and related UI elements",
      beats: [
        {
          beat: 4,
          event: ELEMENT_LIBRARY_EVENT_TYPES.ELEMENT_LIBRARY_OPENED,
          title: "Element Library Content Update",
          description: "Updates element library content when panel is opened",
          dynamics: MUSICAL_DYNAMICS.MEZZO_PIANO,
          timing: MUSICAL_TIMING.DELAYED,
          data: {
            phase: 'content-update',
            operation: 'library-refresh'
          },
          dependencies: [LAYOUT_EVENT_TYPES.PANEL_OPENED],
          errorHandling: 'continue'
        },
        {
          beat: 5,
          event: CONTROL_PANEL_EVENT_TYPES.CONTROL_PANEL_OPENED,
          title: "Control Panel Content Update",
          description: "Updates control panel content when panel is opened",
          dynamics: MUSICAL_DYNAMICS.MEZZO_PIANO,
          timing: MUSICAL_TIMING.DELAYED,
          data: {
            phase: 'content-update',
            operation: 'control-panel-refresh'
          },
          dependencies: [LAYOUT_EVENT_TYPES.PANEL_OPENED],
          errorHandling: 'continue'
        }
      ]
    },
    {
      name: "Layout Adjustment Movement",
      description: "Adjusts layout and canvas area based on panel visibility",
      beats: [
        {
          beat: 6,
          event: LAYOUT_EVENT_TYPES.LAYOUT_MODE_CHANGED,
          title: "Layout Recalculation",
          description: "Recalculates layout dimensions based on panel visibility",
          dynamics: MUSICAL_DYNAMICS.PIANO,
          timing: MUSICAL_TIMING.SYNCHRONIZED,
          data: {
            phase: 'layout-adjustment',
            operation: 'dimension-recalculation'
          },
          dependencies: [
            LAYOUT_EVENT_TYPES.PANEL_OPENED,
            LAYOUT_EVENT_TYPES.PANEL_CLOSED
          ],
          errorHandling: 'continue'
        }
      ]
    }
  ],
  metadata: {
    version: "1.0.0",
    author: "RenderX Evolution System",
    created: new Date(),
    tags: ["panel-toggle", "layout", "ui-interaction", "element-library", "control-panel"]
  }
};

/**
 * Layout Mode Change Symphony No. 2
 * Handles layout mode transitions (editor, preview, fullscreen-preview)
 */
export const LAYOUT_MODE_CHANGE_SEQUENCE: MusicalSequence = {
  name: "Layout Mode Change Symphony No. 2",
  description: "Orchestrates layout mode transitions through musical sequence beats",
  key: "G Major",
  tempo: 130,
  timeSignature: "4/4",
  category: SEQUENCE_CATEGORIES.USER_INTERACTIONS,
  movements: [
    {
      name: "Mode Transition Movement",
      description: "Handles the core layout mode transition",
      beats: [
        {
          beat: 1,
          event: LAYOUT_EVENT_TYPES.LAYOUT_MODE_SWITCHING,
          title: "Mode Transition Start",
          description: "Initiates layout mode transition with preparation",
          dynamics: MUSICAL_DYNAMICS.FORTE,
          timing: MUSICAL_TIMING.IMMEDIATE,
          data: {
            phase: 'transition-start',
            operation: 'mode-switching'
          },
          errorHandling: 'continue'
        },
        {
          beat: 2,
          event: LAYOUT_EVENT_TYPES.LAYOUT_MODE_CHANGED,
          title: "Mode Change Complete",
          description: "Completes layout mode change with state update",
          dynamics: MUSICAL_DYNAMICS.FORTE,
          timing: MUSICAL_TIMING.AFTER_BEAT,
          data: {
            phase: 'transition-complete',
            operation: 'mode-changed'
          },
          dependencies: [LAYOUT_EVENT_TYPES.LAYOUT_MODE_SWITCHING],
          errorHandling: 'continue'
        }
      ]
    },
    {
      name: "UI Adaptation Movement",
      description: "Adapts UI elements for the new layout mode",
      beats: [
        {
          beat: 3,
          event: LAYOUT_EVENT_TYPES.FULLSCREEN_ENTERED,
          title: "Fullscreen Mode Activation",
          description: "Activates fullscreen mode with proper UI adjustments",
          dynamics: MUSICAL_DYNAMICS.MEZZO_FORTE,
          timing: MUSICAL_TIMING.IMMEDIATE,
          data: {
            phase: 'fullscreen-activation',
            operation: 'fullscreen-enter'
          },
          dependencies: [LAYOUT_EVENT_TYPES.LAYOUT_MODE_CHANGED],
          errorHandling: 'continue'
        },
        {
          beat: 4,
          event: LAYOUT_EVENT_TYPES.FULLSCREEN_EXITED,
          title: "Fullscreen Mode Deactivation",
          description: "Exits fullscreen mode with proper UI restoration",
          dynamics: MUSICAL_DYNAMICS.MEZZO_FORTE,
          timing: MUSICAL_TIMING.IMMEDIATE,
          data: {
            phase: 'fullscreen-deactivation',
            operation: 'fullscreen-exit'
          },
          dependencies: [LAYOUT_EVENT_TYPES.LAYOUT_MODE_CHANGED],
          errorHandling: 'continue'
        }
      ]
    }
  ],
  metadata: {
    version: "1.0.0",
    author: "RenderX Evolution System",
    created: new Date(),
    tags: ["layout-mode", "fullscreen", "preview", "editor", "ui-adaptation"]
  }
};

/**
 * Convenience Functions for Panel and Layout Sequences
 * Following the anti-pattern resolution strategy pattern
 */

/**
 * Start Panel Toggle Flow
 * Replaces direct event emissions with proper musical sequence orchestration
 *
 * @param conductor - The musical conductor instance
 * @param panelType - Type of panel being toggled ('elementLibrary' | 'controlPanel')
 * @param newState - New visibility state (true = visible, false = hidden)
 * @param options - Toggle options and configuration
 * @returns Sequence execution ID
 */
export const startPanelToggleFlow = (
  conductor: any,
  panelType: 'elementLibrary' | 'controlPanel',
  newState: boolean,
  options: {
    animated?: boolean;
    duration?: number;
    updateLayout?: boolean;
  } = {}
): string => {
  return conductor.startSequence('Panel Toggle Symphony No. 1', {
    panelType,
    newState,
    previousState: !newState,
    options,
    timestamp: Date.now(),
    sequenceId: `panel-toggle-${panelType}-${Date.now()}`,
    context: {
      source: 'layout-manager',
      operation: 'panel-toggle',
      phase: 'initialization',
      panelType
    }
  });
};

/**
 * Start Layout Mode Change Flow
 * Handles layout mode transitions through musical sequence
 *
 * @param conductor - The musical conductor instance
 * @param previousMode - Previous layout mode
 * @param currentMode - New layout mode
 * @param options - Mode change options
 * @returns Sequence execution ID
 */
export const startLayoutModeChangeFlow = (
  conductor: any,
  previousMode: 'editor' | 'preview' | 'fullscreen-preview',
  currentMode: 'editor' | 'preview' | 'fullscreen-preview',
  options: {
    animated?: boolean;
    preserveState?: boolean;
  } = {}
): string => {
  return conductor.startSequence('Layout Mode Change Symphony No. 2', {
    previousMode,
    currentMode,
    options,
    timestamp: Date.now(),
    sequenceId: `layout-mode-${currentMode}-${Date.now()}`,
    context: {
      source: 'layout-manager',
      operation: 'mode-change',
      phase: 'initialization',
      transition: `${previousMode}-to-${currentMode}`
    }
  });
};

/**
 * Register Panel Toggle Sequences with Conductor
 * Ensures sequences are properly registered before being called
 *
 * @param conductor - The musical conductor instance
 */
export const registerPanelToggleSequences = (conductor: any): void => {
  if (!conductor) {
    console.warn('🚨 Panel Toggle: No conductor provided for registration');
    return;
  }

  console.log('🎼 Registering Panel Toggle Musical Sequences');

  // Register both sequences with proper sequence names matching the startSequence calls
  conductor.registerSequence(PANEL_TOGGLE_SEQUENCE);
  conductor.registerSequence(LAYOUT_MODE_CHANGE_SEQUENCE);

  console.log('✅ Panel Toggle sequences registered successfully');
};

// Auto-register sequences when this module is imported (for validation purposes)
// Note: This will be overridden by the main registration system
if (typeof window !== 'undefined' && (window as any).renderxConductor) {
  registerPanelToggleSequences((window as any).renderxConductor);
}
