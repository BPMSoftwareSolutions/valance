var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var stdin_exports = {};
__export(stdin_exports, {
  CANVAS_LIBRARY_DROP_SEQUENCE: () => CANVAS_LIBRARY_DROP_SEQUENCE,
  startCanvasLibraryDropFlow: () => startCanvasLibraryDropFlow
});
module.exports = __toCommonJS(stdin_exports);
var CORE_EVENT_TYPES = {
  // Component Events
  COMPONENT_MOUNTED: "component-mounted",
  COMPONENT_UNMOUNTED: "component-unmounted",
  COMPONENT_UPDATED: "component-updated",
  COMPONENT_ERROR: "component-error",
  // System Events
  SYSTEM_ERROR: "system-error",
  SYSTEM_WARNING: "system-warning",
  SYSTEM_INFO: "system-info"
};
var CANVAS_EVENT_TYPES = {
  // Canvas Element Events
  CANVAS_ELEMENT_ADDED: "canvas-element-added",
  CANVAS_ELEMENT_SELECTED: "canvas-element-selected",
  CANVAS_ELEMENT_MOVED: "canvas-element-moved",
  CANVAS_ELEMENT_DELETED: "canvas-element-deleted",
  CANVAS_ELEMENT_UPDATED: "canvas-element-updated",
  CANVAS_ELEMENT_CREATED: "canvas-element-created",
  // Canvas State Events
  CANVAS_STATE_CHANGED: "canvas-state-changed",
  CANVAS_STATE_BACKUP_REQUEST: "canvas-state-backup-request",
  CANVAS_STATE_BACKUP_RESPONSE: "canvas-state-backup-response",
  CANVAS_STATE_RESTORE_REQUEST: "canvas-state-restore-request",
  // Canvas Interaction Events
  CANVAS_CLICKED: "canvas-clicked",
  CANVAS_DRAG_START: "canvas-drag-start",
  CANVAS_DRAG_END: "canvas-drag-end",
  CANVAS_DROP: "canvas-drop",
  // Canvas Drag & Drop Events
  CANVAS_DRAG_OVER: "canvas-drag-over",
  CANVAS_DROP_VALIDATION: "canvas-drop-validation",
  CANVAS_SELECTION_CHANGED: "canvas-selection-changed",
  // Visual Tools Events
  ACTIVATE_VISUAL_TOOLS: "activate-visual-tools",
  DROP_ZONE_CLEANUP: "drop-zone-cleanup",
  // Canvas Tool Events
  CANVAS_TOOL_SELECTED: "canvas-tool-selected",
  CANVAS_ZOOM_CHANGED: "canvas-zoom-changed",
  CANVAS_PAN_CHANGED: "canvas-pan-changed"
};
var CONTROL_PANEL_EVENT_TYPES = {
  // Control Panel Events
  CONTROL_PANEL_UPDATE: "control-panel-update",
  CONTROL_PANEL_OPENED: "control-panel-opened",
  CONTROL_PANEL_CLOSED: "control-panel-closed",
  // Property Events
  PROPERTY_CHANGED: "property-changed",
  PROPERTY_VALIDATED: "property-validated",
  PROPERTY_RESET: "property-reset",
  // Element Property Events
  ELEMENT_PROPERTY_UPDATED: "element-property-updated",
  ELEMENT_STYLE_CHANGED: "element-style-changed",
  ELEMENT_POSITION_CHANGED: "element-position-changed",
  ELEMENT_SIZE_CHANGED: "element-size-changed"
};
var LAYOUT_EVENT_TYPES = {
  // Layout Mode Events
  LAYOUT_MODE_CHANGED: "layout-mode-changed",
  LAYOUT_MODE_SWITCHING: "layout-mode-switching",
  // Panel Events
  PANEL_TOGGLED: "panel-toggled",
  PANEL_OPENED: "panel-opened",
  PANEL_CLOSED: "panel-closed",
  PANEL_RESIZED: "panel-resized",
  // Theme Events
  THEME_CHANGED: "theme-changed",
  THEME_SWITCHING: "theme-switching",
  // Viewport Events
  VIEWPORT_RESIZED: "viewport-resized",
  FULLSCREEN_ENTERED: "fullscreen-entered",
  FULLSCREEN_EXITED: "fullscreen-exited"
};
var ELEMENT_LIBRARY_EVENT_TYPES = {
  // Element Library Events
  ELEMENT_LIBRARY_OPENED: "element-library-opened",
  ELEMENT_LIBRARY_CLOSED: "element-library-closed",
  ELEMENT_LIBRARY_REFRESHED: "element-library-refreshed",
  // Component Loading Events
  COMPONENT_LOADING_STARTED: "component-loading-started",
  COMPONENT_LOADING_COMPLETED: "component-loading-completed",
  COMPONENT_LOADING_FAILED: "component-loading-failed",
  // Component Events
  COMPONENT_SELECTED: "component-selected",
  COMPONENT_DESELECTED: "component-deselected",
  COMPONENT_DRAG_STARTED: "component-drag-started",
  COMPONENT_DRAG_ENDED: "component-drag-ended",
  // Library Drag Events
  LIBRARY_DRAG_STARTED: "library-drag-started",
  LIBRARY_DRAG_ENDED: "library-drag-ended",
  LIBRARY_DRAG_OVER: "library-drag-over",
  LIBRARY_DRAG_LEAVE: "library-drag-leave",
  // JSON Component Events
  JSON_COMPONENT_LOADED: "json-component-loaded",
  JSON_COMPONENT_VALIDATED: "json-component-validated",
  JSON_COMPONENT_REGISTERED: "json-component-registered"
};
var EVENT_TYPES = {
  // Core Events
  ...CORE_EVENT_TYPES,
  // Canvas Events
  ...CANVAS_EVENT_TYPES,
  // Control Panel Events
  ...CONTROL_PANEL_EVENT_TYPES,
  // Layout Events
  ...LAYOUT_EVENT_TYPES,
  // Element Library Events
  ...ELEMENT_LIBRARY_EVENT_TYPES,
  // Musical Conductor Events
  ...MUSICAL_CONDUCTOR_EVENT_TYPES
};
var MUSICAL_DYNAMICS = {
  PIANISSIMO: "pp",
  // Very soft - lowest priority
  PIANO: "p",
  // Soft - low priority  
  MEZZO_PIANO: "mp",
  // Medium soft - medium-low priority
  MEZZO_FORTE: "mf",
  // Medium loud - medium priority
  FORTE: "f",
  // Loud - high priority
  FORTISSIMO: "ff"
  // Very loud - highest priority
};
var MUSICAL_TIMING = {
  IMMEDIATE: "immediate",
  // Execute immediately when beat is reached
  AFTER_BEAT: "after-beat",
  // Execute after dependencies complete
  DELAYED: "delayed",
  // Execute with intentional delay
  SYNCHRONIZED: "synchronized"
  // Execute synchronized with other events
};
var SEQUENCE_CATEGORIES = {
  COMPONENT_UI: "component-ui",
  // UI component interactions
  CANVAS_OPERATIONS: "canvas-operations",
  // Canvas manipulation
  DATA_FLOW: "data-flow",
  // Data processing and flow
  SYSTEM_EVENTS: "system-events",
  // System-level events
  USER_INTERACTIONS: "user-interactions",
  // User input handling
  INTEGRATION: "integration"
  // External integrations
};
var MUSICAL_CONDUCTOR_EVENT_TYPES = {
  // Conductor Lifecycle
  CONDUCTOR_INITIALIZED: "conductor-initialized",
  CONDUCTOR_DESTROYED: "conductor-destroyed",
  CONDUCTOR_RESET: "conductor-reset",
  // Sequence Management
  SEQUENCE_DEFINED: "sequence-defined",
  SEQUENCE_UNDEFINED: "sequence-undefined",
  SEQUENCE_REGISTERED: "sequence-registered",
  SEQUENCE_UNREGISTERED: "sequence-unregistered",
  // Sequence Execution
  SEQUENCE_STARTED: "sequence-started",
  SEQUENCE_COMPLETED: "sequence-completed",
  SEQUENCE_FAILED: "sequence-failed",
  SEQUENCE_CANCELLED: "sequence-cancelled",
  SEQUENCE_PAUSED: "sequence-paused",
  SEQUENCE_RESUMED: "sequence-resumed",
  // Beat Execution
  BEAT_STARTED: "beat-started",
  BEAT_COMPLETED: "beat-completed",
  BEAT_FAILED: "beat-failed",
  // Queue Management
  SEQUENCE_QUEUED: "sequence-queued",
  SEQUENCE_DEQUEUED: "sequence-dequeued",
  QUEUE_PROCESSED: "queue-processed",
  // Statistics
  STATISTICS_UPDATED: "statistics-updated"
};
var MUSICAL_SEQUENCE_TEMPLATE = {
  name: "Template Sequence",
  description: "Template for creating new musical sequences",
  key: "C Major",
  tempo: 120,
  timeSignature: "4/4",
  category: SEQUENCE_CATEGORIES.COMPONENT_UI,
  movements: [{
    name: "Template Movement",
    description: "Template movement with example beats",
    beats: [{
      beat: 1,
      event: "template-event",
      title: "Template Beat",
      description: "Example beat for template",
      dynamics: MUSICAL_DYNAMICS.MEZZO_FORTE,
      timing: MUSICAL_TIMING.IMMEDIATE,
      data: {},
      errorHandling: "continue"
    }]
  }],
  metadata: {
    version: "1.0.0",
    author: "RenderX System",
    created: /* @__PURE__ */ new Date(),
    tags: ["template", "example"]
  }
};
var CANVAS_LIBRARY_DROP_SEQUENCE = {
  name: "Canvas Library Drop Symphony No. 33",
  description: "Element Creation - Dynamic library element drop sequence",
  key: "E Major",
  tempo: 130,
  timeSignature: "4/4",
  category: SEQUENCE_CATEGORIES.CANVAS_OPERATIONS,
  movements: [
    {
      name: "Element Creation Allegro",
      description: "4-beat dynamic theme for library element drops",
      beats: [
        {
          beat: 1,
          event: EVENT_TYPES.LIBRARY_DRAG_START,
          title: "Library Drag Initiation",
          description: "Initiates library element drag operation",
          dynamics: MUSICAL_DYNAMICS.FORTE,
          timing: MUSICAL_TIMING.IMMEDIATE,
          dependencies: []
        },
        {
          beat: 2,
          event: EVENT_TYPES.CANVAS_DROP_VALIDATION,
          title: "Canvas Drop Validation",
          description: "Validates drop position and creates element",
          dynamics: MUSICAL_DYNAMICS.MEZZO_FORTE,
          timing: MUSICAL_TIMING.SYNCHRONIZED,
          dependencies: [EVENT_TYPES.LIBRARY_DRAG_START]
        },
        {
          beat: 3,
          event: EVENT_TYPES.CANVAS_ELEMENT_CREATED,
          title: "Element Creation",
          description: "Creates new element on canvas",
          dynamics: MUSICAL_DYNAMICS.MEZZO_FORTE,
          timing: MUSICAL_TIMING.SYNCHRONIZED,
          dependencies: [EVENT_TYPES.CANVAS_DROP_VALIDATION]
        },
        {
          beat: 4,
          event: EVENT_TYPES.CANVAS_ELEMENT_POSITIONED,
          title: "Element Positioning",
          description: "Positions element and completes creation",
          dynamics: MUSICAL_DYNAMICS.FORTE,
          timing: MUSICAL_TIMING.IMMEDIATE,
          dependencies: [EVENT_TYPES.CANVAS_ELEMENT_CREATED]
        }
      ]
    }
  ]
};
var startCanvasLibraryDropFlow = (conductor, libraryElement, dropPosition, options = {}) => {
  conductor.registerSequence(CANVAS_LIBRARY_DROP_SEQUENCE);
  return conductor.startSequence("Canvas Library Drop Symphony No. 33", {
    libraryElement,
    dropPosition,
    options,
    timestamp: /* @__PURE__ */ new Date(),
    sequenceId: `library-drop-${Date.now()}`
  });
};
