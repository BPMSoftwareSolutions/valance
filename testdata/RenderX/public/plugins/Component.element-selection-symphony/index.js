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
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var stdin_exports = {};
__export(stdin_exports, {
  CANVAS_ELEMENT_SELECTION_SEQUENCE: () => import_sequence.CANVAS_ELEMENT_SELECTION_SEQUENCE,
  CIAPlugin: () => CIAPlugin,
  PLUGIN_INFO: () => PLUGIN_INFO,
  canElementBeSelected: () => import_selectionValidation.canElementBeSelected,
  default: () => stdin_default,
  getSelectionConstraints: () => import_selectionValidation.getSelectionConstraints,
  handleCanvasElementSelected: () => import_onSelectionStart.default,
  handleCanvasSelectionChanged: () => import_onSelectionChange.default,
  handleCanvasSelectionStateSync: () => import_onSelectionEnd.handleCanvasSelectionStateSync,
  handleCanvasSelectionVisualUpdate: () => import_onSelectionEnd.default,
  processElementSelection: () => import_selectionProcessing.processElementSelection,
  startCanvasElementSelectionFlow: () => import_sequence.startCanvasElementSelectionFlow,
  syncSelectionState: () => import_selectionCoordination.syncSelectionState,
  updateSelectionVisuals: () => import_selectionCoordination.updateSelectionVisuals,
  useCanvasElementSelection: () => import_hooks.useCanvasElementSelection,
  useCanvasElementSelectionDefault: () => import_hooks.default,
  validateSelectionContext: () => import_selectionValidation.validateSelectionContext
});
module.exports = __toCommonJS(stdin_exports);
var import_sequence = require("./sequence.ts");
var import_onSelectionStart = __toESM(require("./handlers/onSelectionStart.ts"));
var import_onSelectionChange = __toESM(require("./handlers/onSelectionChange.ts"));
var import_onSelectionEnd = __toESM(require("./handlers/onSelectionEnd.ts"));
var import_selectionValidation = require("./logic/selectionValidation.ts");
var import_selectionProcessing = require("./logic/selectionProcessing.ts");
var import_selectionCoordination = require("./logic/selectionCoordination.ts");
var import_hooks = __toESM(require("./hooks/index.ts"));
const PLUGIN_INFO = {
  id: "ElementSelection.element-selection-symphony",
  name: "Canvas Element Selection Symphony No. 37",
  version: "1.0.0",
  description: "Selection Harmony - Dynamic element selection sequence",
  category: "canvas-operations",
  type: "symphony-plugin"
};
const CIAPlugin = {
  mount: (conductor, eventBus) => {
    console.log("\u{1F3BC} ElementSelection Plugin: Mounting...");
    try {
      conductor.registerSequence(CANVAS_ELEMENT_SELECTION_SEQUENCE);
      eventBus.subscribe("canvas:element:select", handleCanvasElementSelected);
      eventBus.subscribe(
        "canvas:selection:change",
        handleCanvasSelectionChanged
      );
      eventBus.subscribe(
        "canvas:selection:visual",
        handleCanvasSelectionVisualUpdate
      );
      eventBus.subscribe(
        "canvas:selection:sync",
        handleCanvasSelectionStateSync
      );
      console.log("\u2705 ElementSelection Plugin: Mounted successfully");
      return true;
    } catch (error) {
      console.error("\u{1F6A8} ElementSelection Plugin: Mount failed:", error);
      return false;
    }
  },
  unmount: (conductor, eventBus) => {
    console.log("\u{1F3BC} ElementSelection Plugin: Unmounting...");
    try {
      eventBus.unsubscribe(
        "canvas:element:select",
        handleCanvasElementSelected
      );
      eventBus.unsubscribe(
        "canvas:selection:change",
        handleCanvasSelectionChanged
      );
      eventBus.unsubscribe(
        "canvas:selection:visual",
        handleCanvasSelectionVisualUpdate
      );
      eventBus.unsubscribe(
        "canvas:selection:sync",
        handleCanvasSelectionStateSync
      );
      console.log("\u2705 ElementSelection Plugin: Unmounted successfully");
      return true;
    } catch (error) {
      console.error("\u{1F6A8} ElementSelection Plugin: Unmount failed:", error);
      return false;
    }
  }
};
var stdin_default = CIAPlugin;
