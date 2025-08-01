/**
 * App Shell Symphony Sequence Definition
 * 
 * Defines the musical sequence for app shell operations including layout changes,
 * panel toggles, theme changes, and shell initialization
 */

// Define sequence categories and event types locally to avoid external dependencies
const SEQUENCE_CATEGORIES = {
  COMPONENT_UI: "component-ui",
  CANVAS_OPERATIONS: "canvas-operations", 
  DATA_FLOW: "data-flow",
  USER_INTERACTIONS: "user-interactions",
  SYSTEM_EVENTS: "system-events"
};

const EVENT_TYPES = {
  // App Shell Events
  LAYOUT_CHANGED: "layout-changed",
  PANEL_TOGGLED: "panel-toggled", 
  THEME_CHANGED: "theme-changed",
  SHELL_READY: "shell-ready"
};

const MUSICAL_DYNAMICS = {
  PIANISSIMO: "pianissimo", // Very soft
  PIANO: "piano", // Soft
  MEZZO_PIANO: "mezzo-piano", // Medium soft
  MEZZO_FORTE: "mezzo-forte", // Medium loud
  FORTE: "forte", // Loud
  FORTISSIMO: "fortissimo" // Very loud
};

const MUSICAL_TIMING = {
  IMMEDIATE: "immediate", // Execute immediately
  DELAYED: "delayed", // Execute with intentional delay
  SYNCHRONIZED: "synchronized" // Execute synchronized with other events
};

export const APP_SHELL_SEQUENCE = {
  name: "App Shell Symphony No. 1",
  description: "Foundation Movement - Core app shell orchestration",
  key: "C Major",
  tempo: 120,
  timeSignature: "4/4",
  category: SEQUENCE_CATEGORIES.SYSTEM_EVENTS,
  movements: [
    {
      name: "Shell Initialization Allegro",
      description: "4-beat foundational theme for app shell setup",
      beats: [
        {
          beat: 1,
          event: EVENT_TYPES.SHELL_READY,
          title: "Shell Readiness",
          description: "Initializes app shell and prepares core systems. Sets up layout structure, theme system, and panel management.",
          dynamics: MUSICAL_DYNAMICS.FORTE,
          timing: MUSICAL_TIMING.IMMEDIATE,
          dependencies: []
        },
        {
          beat: 2,
          event: EVENT_TYPES.LAYOUT_CHANGED,
          title: "Layout Configuration",
          description: "Configures initial layout mode and responsive behavior. Handles viewport changes and layout adaptation.",
          dynamics: MUSICAL_DYNAMICS.MEZZO_FORTE,
          timing: MUSICAL_TIMING.SYNCHRONIZED,
          dependencies: [EVENT_TYPES.SHELL_READY]
        },
        {
          beat: 3,
          event: EVENT_TYPES.PANEL_TOGGLED,
          title: "Panel Management",
          description: "Manages panel visibility and state. Handles panel animations, state persistence, and user preferences.",
          dynamics: MUSICAL_DYNAMICS.MEZZO_FORTE,
          timing: MUSICAL_TIMING.SYNCHRONIZED,
          dependencies: [EVENT_TYPES.LAYOUT_CHANGED]
        },
        {
          beat: 4,
          event: EVENT_TYPES.THEME_CHANGED,
          title: "Theme Application",
          description: "Applies theme changes and visual styling. Updates CSS variables, component themes, and user preferences.",
          dynamics: MUSICAL_DYNAMICS.FORTE,
          timing: MUSICAL_TIMING.IMMEDIATE,
          dependencies: [EVENT_TYPES.PANEL_TOGGLED]
        }
      ]
    }
  ]
};

export const sequence = APP_SHELL_SEQUENCE;

// Flow starter function
export const startAppShellFlow = () => {
  console.log("🎼 Starting App Shell Symphony flow...");
  return {
    sequence: APP_SHELL_SEQUENCE,
    status: "started",
    timestamp: Date.now()
  };
};
