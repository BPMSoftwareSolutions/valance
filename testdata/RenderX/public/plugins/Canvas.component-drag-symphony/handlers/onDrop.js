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
  default: () => handleCanvasDropValidation,
  handleCanvasDropValidation: () => handleCanvasDropValidation,
  handleCanvasElementCSSSync: () => handleCanvasElementCSSSync
});
module.exports = __toCommonJS(stdin_exports);
var import_dragCoordination = require("../logic/dragCoordination");
const handleCanvasDropValidation = (data) => {
  console.log("\u{1F3BC} ComponentDrag Handler: Canvas Drop Validation", data);
  try {
    const { elementId, changes, source, elements, dragData } = data;
    if (!elementId || !changes || !source) {
      console.log("\u{1F3BC} ComponentDrag Handler: Not a component drag event, skipping");
      return true;
    }
    const result = (0, import_dragCoordination.coordinateDragState)(elementId, changes, source, elements, dragData);
    console.log("\u{1F3BC} ComponentDrag Handler: Canvas Drop Validation completed successfully");
    return result;
  } catch (error) {
    console.error("\u{1F3BC} ComponentDrag Handler: Canvas Drop Validation failed:", error);
    return false;
  }
};
const handleCanvasElementCSSSync = (data) => {
  console.log("\u{1F3BC} ComponentDrag Handler: Canvas Element CSS Sync", data);
  try {
    const { elementId, changes, source, elements, capturedElement, syncElementCSS } = data;
    if (!elementId || !changes || !source) {
      console.log("\u{1F3BC} ComponentDrag Handler: Canvas Element CSS Sync - Not a component drag event, skipping");
      return true;
    }
    const result = (0, import_dragCoordination.syncDragChanges)(elementId, changes, source, elements, capturedElement, syncElementCSS);
    console.log("\u{1F3BC} ComponentDrag Handler: Canvas Element CSS Sync completed successfully");
    return result;
  } catch (error) {
    console.error("\u{1F3BC} ComponentDrag Handler: Canvas Element CSS Sync failed:", error);
    return false;
  }
};
