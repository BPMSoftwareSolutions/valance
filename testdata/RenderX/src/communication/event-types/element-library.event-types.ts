/**
 * Element Library Event Types
 * Event types related to element library operations and component management
 */

export const ELEMENT_LIBRARY_EVENT_TYPES = {
  // Element Library Events
  ELEMENT_LIBRARY_OPENED: 'element-library-opened',
  ELEMENT_LIBRARY_CLOSED: 'element-library-closed',
  ELEMENT_LIBRARY_REFRESHED: 'element-library-refreshed',

  // Component Loading Events
  COMPONENT_LOADING_STARTED: 'component-loading-started',
  COMPONENT_LOADING_COMPLETED: 'component-loading-completed',
  COMPONENT_LOADING_FAILED: 'component-loading-failed',

  // Component Events
  COMPONENT_SELECTED: 'component-selected',
  COMPONENT_DESELECTED: 'component-deselected',
  COMPONENT_DRAG_STARTED: 'component-drag-started',
  COMPONENT_DRAG_ENDED: 'component-drag-ended',

  // Library Drag Events
  LIBRARY_DRAG_STARTED: 'library-drag-started',
  LIBRARY_DRAG_ENDED: 'library-drag-ended',
  LIBRARY_DRAG_OVER: 'library-drag-over',
  LIBRARY_DRAG_LEAVE: 'library-drag-leave',

  // JSON Component Events
  JSON_COMPONENT_LOADED: 'json-component-loaded',
  JSON_COMPONENT_VALIDATED: 'json-component-validated',
  JSON_COMPONENT_REGISTERED: 'json-component-registered'
} as const;

export type ElementLibraryEventType = typeof ELEMENT_LIBRARY_EVENT_TYPES[keyof typeof ELEMENT_LIBRARY_EVENT_TYPES];
