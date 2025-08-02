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
  usePanelToggle: () => usePanelToggle
});
module.exports = __toCommonJS(stdin_exports);
var import_react = require("react");
const usePanelToggle = ({ conductor, onPanelToggled }) => {
  const startPanelToggleSequence = (0, import_react.useCallback)((panelType, newState, options = {}) => {
    if (!conductor) {
      console.warn("\u{1F3BC} PanelToggle Hook: Conductor not available");
      return null;
    }
    return conductor.startSequence("Panel Toggle Symphony No. 1", {
      panelType,
      newState,
      options,
      timestamp: /* @__PURE__ */ new Date(),
      sequenceId: `panel-toggle-${Date.now()}`
    });
  }, [conductor]);
  const togglePanel = (0, import_react.useCallback)((panelType, newState, options = {}) => {
    console.log("\u{1F3BC} PanelToggle Hook: Toggle Panel", { panelType, newState });
    const sequenceId = startPanelToggleSequence(panelType, newState, options);
    if (sequenceId && onPanelToggled) {
      onPanelToggled(panelType, newState);
    }
    return sequenceId;
  }, [startPanelToggleSequence, onPanelToggled]);
  return {
    startPanelToggleSequence,
    togglePanel
  };
};
var stdin_default = usePanelToggle;
