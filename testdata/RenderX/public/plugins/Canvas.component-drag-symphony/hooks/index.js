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
  default: () => stdin_default,
  useCanvasComponentDrag: () => useCanvasComponentDrag
});
module.exports = __toCommonJS(stdin_exports);
var import_react = require("react");
var import_dragValidation = require("../logic/dragValidation");
var import_dragProcessing = require("../logic/dragProcessing");
var import_dragCoordination = require("../logic/dragCoordination");
const useCanvasComponentDrag = ({
  conductor,
  elements,
  setElements,
  syncElementCSS,
  canvasBounds,
  enableGridSnap = false,
  gridSize = 20
}) => {
  const startDragSequence = (0, import_react.useCallback)((elementId, eventData) => {
    if (!conductor) {
      console.warn("\u{1F3BC} ComponentDrag Hook: Conductor not available");
      return null;
    }
    const element = elements.find((el) => el.id === elementId);
    if (!element) {
      console.warn("\u{1F3BC} ComponentDrag Hook: Element not found:", elementId);
      return null;
    }
    return conductor.startSequence("Canvas Component Drag Symphony No. 4", {
      element,
      eventData,
      elements,
      setElements,
      syncElementCSS,
      canvasBounds,
      enableGridSnap,
      gridSize,
      timestamp: /* @__PURE__ */ new Date(),
      sequenceId: `canvas-drag-${Date.now()}`
    });
  }, [conductor, elements, setElements, syncElementCSS, canvasBounds, enableGridSnap, gridSize]);
  const handleDragStart = (0, import_react.useCallback)((elementId, startPosition) => {
    console.log("\u{1F3BC} ComponentDrag Hook: Drag Start", { elementId, startPosition });
    const eventData = {
      type: "drag-start",
      startPosition,
      timestamp: /* @__PURE__ */ new Date()
    };
    return startDragSequence(elementId, eventData);
  }, [startDragSequence]);
  const handleDragMove = (0, import_react.useCallback)((elementId, newPosition) => {
    console.log("\u{1F3BC} ComponentDrag Hook: Drag Move", { elementId, newPosition });
    const element = elements.find((el) => el.id === elementId);
    if (!element)
      return false;
    const changes = {
      x: newPosition.x,
      y: newPosition.y,
      snapToGrid: enableGridSnap,
      gridSize
    };
    return (0, import_dragProcessing.processElementDrag)(elementId, changes, "canvas-drag", elements, setElements);
  }, [elements, setElements, enableGridSnap, gridSize]);
  const handleDragEnd = (0, import_react.useCallback)((elementId, finalPosition) => {
    console.log("\u{1F3BC} ComponentDrag Hook: Drag End", { elementId, finalPosition });
    const element = elements.find((el) => el.id === elementId);
    if (!element)
      return false;
    const changes = {
      x: finalPosition.x,
      y: finalPosition.y
    };
    const coordinated = (0, import_dragCoordination.coordinateDragState)(elementId, changes, "canvas-drag", elements);
    if (coordinated && syncElementCSS) {
      (0, import_dragCoordination.syncDragChanges)(elementId, changes, "canvas-drag", elements, element, syncElementCSS);
    }
    return coordinated;
  }, [elements, syncElementCSS]);
  const canDragElement = (0, import_react.useCallback)((elementId) => {
    const element = elements.find((el) => el.id === elementId);
    if (!element)
      return false;
    return (0, import_dragValidation.validateDragContext)(elementId, {}, "canvas-drag", elements);
  }, [elements]);
  return {
    startDragSequence,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    canDragElement
  };
};
var stdin_default = useCanvasComponentDrag;
