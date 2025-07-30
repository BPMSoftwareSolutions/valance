/**
 * Control Panel Event Types
 * Event types related to control panel operations and property management
 */

export const CONTROL_PANEL_EVENT_TYPES = {
  // Control Panel Events
  CONTROL_PANEL_UPDATE: 'control-panel-update',
  CONTROL_PANEL_OPENED: 'control-panel-opened',
  CONTROL_PANEL_CLOSED: 'control-panel-closed',

  // Property Events
  PROPERTY_CHANGED: 'property-changed',
  PROPERTY_VALIDATED: 'property-validated',
  PROPERTY_RESET: 'property-reset',

  // Element Property Events
  ELEMENT_PROPERTY_UPDATED: 'element-property-updated',
  ELEMENT_STYLE_CHANGED: 'element-style-changed',
  ELEMENT_POSITION_CHANGED: 'element-position-changed',
  ELEMENT_SIZE_CHANGED: 'element-size-changed'
} as const;

export type ControlPanelEventType = typeof CONTROL_PANEL_EVENT_TYPES[keyof typeof CONTROL_PANEL_EVENT_TYPES];
