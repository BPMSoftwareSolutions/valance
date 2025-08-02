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
  useCanvasElementSelection: () => useCanvasElementSelection
});
module.exports = __toCommonJS(stdin_exports);
var import_react = require("react");
var import_selectionValidation = require("../logic/selectionValidation");
var import_selectionProcessing = require("../logic/selectionProcessing");
var import_selectionCoordination = require("../logic/selectionCoordination");
const useCanvasElementSelection = ({
  conductor,
  currentSelection,
  setSelection,
  visualFeedback = true,
  updateHistory = true
}) => {
  const startSelectionSequence = (0, import_react.useCallback)((element, selectionType = "single") => {
    if (!conductor) {
      console.warn("\u{1F3BC} ElementSelection Hook: Conductor not available");
      return null;
    }
    return conductor.startSequence("Canvas Element Selection Symphony No. 37", {
      element,
      selectionType,
      currentSelection,
      visualFeedback,
      updateHistory,
      timestamp: /* @__PURE__ */ new Date(),
      sequenceId: `canvas-selection-${Date.now()}`
    });
  }, [conductor, currentSelection, visualFeedback, updateHistory]);
  const selectElement = (0, import_react.useCallback)((element, selectionType = "single") => {
    console.log("\u{1F3BC} ElementSelection Hook: Select Element", { element: element.id, selectionType });
    if (!(0, import_selectionValidation.validateSelectionContext)(element, void 0, selectionType)) {
      console.warn("\u{1F3BC} ElementSelection Hook: Selection validation failed");
      return false;
    }
    const result = (0, import_selectionProcessing.processElementSelection)(element, selectionType, currentSelection, selectionType === "single");
    if (result.success) {
      setSelection(result.updatedSelection);
      if (visualFeedback) {
        (0, import_selectionCoordination.updateSelectionVisuals)(element, result.updatedSelection);
      }
      if (updateHistory) {
        (0, import_selectionCoordination.syncSelectionState)(element, result.updatedSelection, true);
      }
      startSelectionSequence(element, selectionType);
      return true;
    }
    return false;
  }, [currentSelection, setSelection, visualFeedback, updateHistory, startSelectionSequence]);
  const clearSelection = (0, import_react.useCallback)(() => {
    console.log("\u{1F3BC} ElementSelection Hook: Clear Selection");
    setSelection([]);
    if (visualFeedback) {
      console.log("\u{1F3BC} ElementSelection Hook: Clearing selection visuals");
    }
  }, [setSelection, visualFeedback]);
  return {
    selectElement,
    clearSelection,
    startSelectionSequence,
    currentSelection
  };
};
var stdin_default = useCanvasElementSelection;
