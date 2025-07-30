/**
 * Layout Event Types
 * Event types related to layout management and UI state changes
 */

export const LAYOUT_EVENT_TYPES = {
  // Layout Mode Events
  LAYOUT_MODE_CHANGED: 'layout-mode-changed',
  LAYOUT_MODE_SWITCHING: 'layout-mode-switching',

  // Panel Events
  PANEL_TOGGLED: 'panel-toggled',
  PANEL_OPENED: 'panel-opened',
  PANEL_CLOSED: 'panel-closed',
  PANEL_RESIZED: 'panel-resized',

  // Theme Events
  THEME_CHANGED: 'theme-changed',
  THEME_SWITCHING: 'theme-switching',

  // Viewport Events
  VIEWPORT_RESIZED: 'viewport-resized',
  FULLSCREEN_ENTERED: 'fullscreen-entered',
  FULLSCREEN_EXITED: 'fullscreen-exited'
} as const;

export type LayoutEventType = typeof LAYOUT_EVENT_TYPES[keyof typeof LAYOUT_EVENT_TYPES];
