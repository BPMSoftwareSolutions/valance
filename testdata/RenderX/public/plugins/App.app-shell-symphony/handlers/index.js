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
  onLayoutChange: () => onLayoutChange,
  onPanelToggle: () => onPanelToggle,
  onShellReady: () => onShellReady,
  onThemeChange: () => onThemeChange
});
module.exports = __toCommonJS(stdin_exports);
const onLayoutChange = (data) => {
  try {
    const { layoutMode, timestamp } = data;
    console.log(`\u{1F3BC} App Shell Symphony: Layout change to ${layoutMode}`);
    if (layoutMode === "fullscreen") {
      console.log("\u{1F4F1} Switching to fullscreen layout");
    } else if (layoutMode === "split") {
      console.log("\u{1F4F1} Switching to split layout");
    }
    return {
      success: true,
      layoutMode,
      timestamp,
      message: `Layout changed to ${layoutMode}`
    };
  } catch (error) {
    console.error("\u274C App Shell Symphony: Layout change failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
};
const onPanelToggle = (data) => {
  try {
    const { panelId, isVisible, timestamp } = data;
    console.log(`\u{1F3BC} App Shell Symphony: Panel ${panelId} ${isVisible ? "shown" : "hidden"}`);
    return {
      success: true,
      panelId,
      isVisible,
      timestamp,
      message: `Panel ${panelId} ${isVisible ? "shown" : "hidden"}`
    };
  } catch (error) {
    console.error("\u274C App Shell Symphony: Panel toggle failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
};
const onThemeChange = (data) => {
  try {
    const { theme, timestamp } = data;
    console.log(`\u{1F3BC} App Shell Symphony: Theme changed to ${theme}`);
    return {
      success: true,
      theme,
      timestamp,
      message: `Theme changed to ${theme}`
    };
  } catch (error) {
    console.error("\u274C App Shell Symphony: Theme change failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
};
const onShellReady = (data) => {
  try {
    const { timestamp } = data;
    console.log("\u{1F3BC} App Shell Symphony: Shell ready");
    return {
      success: true,
      timestamp,
      message: "App shell is ready"
    };
  } catch (error) {
    console.error("\u274C App Shell Symphony: Shell ready failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
};
