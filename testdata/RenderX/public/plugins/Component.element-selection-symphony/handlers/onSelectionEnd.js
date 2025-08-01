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
  default: () => handleCanvasSelectionVisualUpdate,
  handleCanvasSelectionStateSync: () => handleCanvasSelectionStateSync,
  handleCanvasSelectionVisualUpdate: () => handleCanvasSelectionVisualUpdate
});
module.exports = __toCommonJS(stdin_exports);
var import_selectionCoordination = require("../logic/selectionCoordination");
const handleCanvasSelectionVisualUpdate = (data) => {
  console.log("\u{1F3BC} ElementSelection Handler: Canvas Selection Visual Update", data);
  try {
    const { element, updatedSelection, visualFeedback = true } = data;
    if (!visualFeedback) {
      return { success: true, skipped: true };
    }
    const result = (0, import_selectionCoordination.updateSelectionVisuals)(element, updatedSelection);
    if (result) {
      console.log("\u{1F3BC} ElementSelection Handler: Visual Feedback Coordination completed successfully");
      return {
        success: true,
        visualsUpdated: true,
        element,
        updatedSelection
      };
    }
    return {
      success: false,
      error: "Visual update failed"
    };
  } catch (error) {
    console.error("\u{1F3BC} ElementSelection Handler: Canvas Selection Visual Update failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};
const handleCanvasSelectionStateSync = (data) => {
  console.log("\u{1F3BC} ElementSelection Handler: Canvas Selection State Sync", data);
  try {
    const { element, updatedSelection, updateHistory = true } = data;
    const result = (0, import_selectionCoordination.syncSelectionState)(element, updatedSelection, updateHistory);
    if (result) {
      console.log("\u{1F3BC} ElementSelection Handler: Selection State Management completed successfully");
      return {
        success: true,
        stateSynced: true,
        element,
        updatedSelection
      };
    }
    return {
      success: false,
      error: "State sync failed"
    };
  } catch (error) {
    console.error("\u{1F3BC} ElementSelection Handler: Canvas Selection State Sync failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};
