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
  CIAPlugin: () => CIAPlugin,
  LAYOUT_MODE_CHANGE_SEQUENCE: () => import_sequence.LAYOUT_MODE_CHANGE_SEQUENCE,
  PANEL_TOGGLE_SEQUENCE: () => import_sequence.PANEL_TOGGLE_SEQUENCE,
  PLUGIN_INFO: () => PLUGIN_INFO,
  default: () => stdin_default,
  handleLayoutChanged: () => import_onLayoutChange.default,
  handlePanelAnimationComplete: () => import_onAnimationComplete.handlePanelAnimationComplete,
  handlePanelAnimationStart: () => import_onAnimationComplete.default,
  handlePanelToggled: () => import_onPanelToggle.default,
  processPanelToggle: () => import_logic.processPanelToggle,
  startLayoutModeChangeFlow: () => import_sequence.startLayoutModeChangeFlow,
  startPanelToggleFlow: () => import_sequence.startPanelToggleFlow,
  usePanelToggle: () => import_hooks.usePanelToggle,
  usePanelToggleDefault: () => import_hooks.default,
  validatePanelToggle: () => import_logic.validatePanelToggle
});
module.exports = __toCommonJS(stdin_exports);
var import_sequence = require("./sequence.ts");
var import_onPanelToggle = __toESM(require("./handlers/onPanelToggle.ts"));
var import_onLayoutChange = __toESM(require("./handlers/onLayoutChange.ts"));
var import_onAnimationComplete = __toESM(require("./handlers/onAnimationComplete.ts"));
var import_logic = require("./logic/index.ts");
var import_hooks = __toESM(require("./hooks/index.ts"));
const PLUGIN_INFO = {
  id: "PanelToggle.panel-toggle-symphony",
  name: "Panel Toggle Symphony No. 1",
  version: "1.0.0",
  description: "Layout Control - Dynamic panel visibility and layout management",
  category: "layout-operations",
  type: "symphony-plugin"
};
const CIAPlugin = {
  mount: (conductor, eventBus) => {
    console.log("\u{1F3BC} PanelToggle Plugin: Mounting...");
    try {
      conductor.registerSequence(PANEL_TOGGLE_SEQUENCE);
      conductor.registerSequence(LAYOUT_MODE_CHANGE_SEQUENCE);
      eventBus.subscribe("layout:panel:toggle", handlePanelToggled);
      eventBus.subscribe("layout:change", handleLayoutChanged);
      eventBus.subscribe("layout:animation:start", handlePanelAnimationStart);
      eventBus.subscribe(
        "layout:animation:complete",
        handlePanelAnimationComplete
      );
      console.log("\u2705 PanelToggle Plugin: Mounted successfully");
      return true;
    } catch (error) {
      console.error("\u{1F6A8} PanelToggle Plugin: Mount failed:", error);
      return false;
    }
  },
  unmount: (conductor, eventBus) => {
    console.log("\u{1F3BC} PanelToggle Plugin: Unmounting...");
    try {
      eventBus.unsubscribe("layout:panel:toggle", handlePanelToggled);
      eventBus.unsubscribe("layout:change", handleLayoutChanged);
      eventBus.unsubscribe("layout:animation:start", handlePanelAnimationStart);
      eventBus.unsubscribe(
        "layout:animation:complete",
        handlePanelAnimationComplete
      );
      console.log("\u2705 PanelToggle Plugin: Unmounted successfully");
      return true;
    } catch (error) {
      console.error("\u{1F6A8} PanelToggle Plugin: Unmount failed:", error);
      return false;
    }
  }
};
var stdin_default = CIAPlugin;
