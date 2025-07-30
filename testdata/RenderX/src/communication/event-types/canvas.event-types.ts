/**
 * Canvas Event Types
 * Event types related to canvas operations and element management
 */

export const CANVAS_EVENT_TYPES = {
  // Canvas Element Events
  CANVAS_ELEMENT_ADDED: 'canvas-element-added',
  CANVAS_ELEMENT_SELECTED: 'canvas-element-selected',
  CANVAS_ELEMENT_MOVED: 'canvas-element-moved',
  CANVAS_ELEMENT_DELETED: 'canvas-element-deleted',
  CANVAS_ELEMENT_UPDATED: 'canvas-element-updated',
  CANVAS_ELEMENT_CREATED: 'canvas-element-created',

  // Canvas State Events
  CANVAS_STATE_CHANGED: 'canvas-state-changed',
  CANVAS_STATE_BACKUP_REQUEST: 'canvas-state-backup-request',
  CANVAS_STATE_BACKUP_RESPONSE: 'canvas-state-backup-response',
  CANVAS_STATE_RESTORE_REQUEST: 'canvas-state-restore-request',

  // Canvas Interaction Events
  CANVAS_CLICKED: 'canvas-clicked',
  CANVAS_DRAG_START: 'canvas-drag-start',
  CANVAS_DRAG_END: 'canvas-drag-end',
  CANVAS_DROP: 'canvas-drop',

  // Canvas Drag & Drop Events
  CANVAS_DRAG_OVER: 'canvas-drag-over',
  CANVAS_DROP_VALIDATION: 'canvas-drop-validation',
  CANVAS_SELECTION_CHANGED: 'canvas-selection-changed',

  // Visual Tools Events
  ACTIVATE_VISUAL_TOOLS: 'activate-visual-tools',
  DROP_ZONE_CLEANUP: 'drop-zone-cleanup',

  // Canvas Tool Events
  CANVAS_TOOL_SELECTED: 'canvas-tool-selected',
  CANVAS_ZOOM_CHANGED: 'canvas-zoom-changed',
  CANVAS_PAN_CHANGED: 'canvas-pan-changed'
} as const;

export type CanvasEventType = typeof CANVAS_EVENT_TYPES[keyof typeof CANVAS_EVENT_TYPES];
