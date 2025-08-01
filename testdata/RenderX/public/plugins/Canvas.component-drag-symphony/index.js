var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === "object") || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (
  (target = mod != null ? __create(__getProtoOf(mod)) : {}),
  __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod
  )
);
var __toCommonJS = (mod) =>
  __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var stdin_exports = {};
__export(stdin_exports, {
  CANVAS_COMPONENT_DRAG_SEQUENCE: () =>
    import_sequence.CANVAS_COMPONENT_DRAG_SEQUENCE,
  sequence: () => import_sequence.CANVAS_COMPONENT_DRAG_SEQUENCE,
  CIAPlugin: () => CIAPlugin,
  PLUGIN_INFO: () => PLUGIN_INFO,
  applyDragFeedback: () => import_dragCoordination.applyDragFeedback,
  calculateElementBounds: () => import_dragProcessing.calculateElementBounds,
  canElementBeDragged: () => import_dragValidation.canElementBeDragged,
  checkElementCollisions: () => import_dragProcessing.checkElementCollisions,
  coordinateDragState: () => import_dragCoordination.coordinateDragState,
  default: () => stdin_default,
  generateTransform: () => import_dragCoordination.generateTransform,
  handleCanvasDragOver: () => import_onDragStart.default,
  handleCanvasDropValidation: () => import_onDrop.default,
  handleCanvasElementCSSSync: () => import_onDrop.handleCanvasElementCSSSync,
  handleCanvasElementMoved: () => import_onDragging.default,
  processElementDrag: () => import_dragProcessing.processElementDrag,
  startCanvasComponentDragFlow: () =>
    import_sequence.startCanvasComponentDragFlow,
  syncDragChanges: () => import_dragCoordination.syncDragChanges,
  useCanvasComponentDrag: () => import_hooks.useCanvasComponentDrag,
  useCanvasComponentDragDefault: () => import_hooks.default,
  validateDragBoundaries: () => import_dragValidation.validateDragBoundaries,
  validateDragContext: () => import_dragValidation.validateDragContext,
});
module.exports = __toCommonJS(stdin_exports);
var import_sequence = require("./sequence.ts");
var import_onDragStart = __toESM(require("./handlers/onDragStart.ts"));
var import_onDragging = __toESM(require("./handlers/onDragging.ts"));
var import_onDrop = __toESM(require("./handlers/onDrop.ts"));
var import_dragValidation = require("./logic/dragValidation.ts");
var import_dragProcessing = require("./logic/dragProcessing.ts");
var import_dragCoordination = require("./logic/dragCoordination.ts");
var import_hooks = __toESM(require("./hooks/index.ts"));
const PLUGIN_INFO = {
  id: "ComponentDrag.component-drag-symphony",
  name: "Canvas Component Drag Symphony No. 4",
  version: "1.0.0",
  description:
    "Dynamic Movement - Dynamic drag operation flow for canvas components",
  category: "canvas-operations",
  type: "symphony-plugin",
  musical: {
    key: "D Major",
    tempo: 140,
    timeSignature: "4/4",
    feel: "Dynamic element dragging with real-time position updates",
  },
};
const CIAPlugin = {
  mount: (conductor, eventBus) => {
    console.log("\u{1F3BC} ComponentDrag Plugin: Mounting...");
    try {
      conductor.registerSequence(CANVAS_COMPONENT_DRAG_SEQUENCE);
      eventBus.subscribe("canvas:element:drag:start", handleCanvasDragOver);
      eventBus.subscribe("canvas:element:drag:move", handleCanvasElementMoved);
      eventBus.subscribe("canvas:element:drag:end", handleCanvasDropValidation);
      eventBus.subscribe("canvas:element:css:sync", handleCanvasElementCSSSync);
      console.log("\u2705 ComponentDrag Plugin: Mounted successfully");
      return true;
    } catch (error) {
      console.error("\u{1F6A8} ComponentDrag Plugin: Mount failed:", error);
      return false;
    }
  },
  unmount: (conductor, eventBus) => {
    console.log("\u{1F3BC} ComponentDrag Plugin: Unmounting...");
    try {
      eventBus.unsubscribe("canvas:element:drag:start", handleCanvasDragOver);
      eventBus.unsubscribe(
        "canvas:element:drag:move",
        handleCanvasElementMoved
      );
      eventBus.unsubscribe(
        "canvas:element:drag:end",
        handleCanvasDropValidation
      );
      eventBus.unsubscribe(
        "canvas:element:css:sync",
        handleCanvasElementCSSSync
      );
      console.log("\u2705 ComponentDrag Plugin: Unmounted successfully");
      return true;
    } catch (error) {
      console.error("\u{1F6A8} ComponentDrag Plugin: Unmount failed:", error);
      return false;
    }
  },
};
var stdin_default = CIAPlugin;
