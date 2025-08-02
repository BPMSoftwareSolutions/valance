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
  onLibraryRefresh: () => onLibraryRefresh
});
module.exports = __toCommonJS(stdin_exports);
const onLibraryRefresh = (data, context) => {
  console.log("\u{1F3BC} Element Library Display Symphony: Library refresh handler triggered", data);
  const { reason = "manual", force = false } = data;
  const { eventBus, conductor, pluginInstance } = context;
  try {
    console.log(`\u{1F504} Refreshing library display (reason: ${reason}, force: ${force})`);
    if (pluginInstance && pluginInstance.updateState) {
      pluginInstance.updateState({
        loading: true,
        error: null,
        refreshing: true
      });
    }
    if (eventBus) {
      eventBus.emit("library:refresh:started", {
        reason,
        force,
        timestamp: Date.now(),
        source: "library-display-symphony"
      });
    }
    if (conductor) {
      const result = conductor.play(
        "json-component-symphony",
        "onLoadStart",
        {
          source: "library-refresh",
          force,
          reason,
          timestamp: Date.now()
        }
      );
      console.log("\u{1F3BC} Component reload sequence triggered:", result);
    }
    return {
      success: true,
      message: "Library refresh initiated",
      reason,
      force
    };
  } catch (error) {
    console.error("\u274C Element Library Display Symphony: Library refresh failed:", error);
    if (pluginInstance && pluginInstance.updateState) {
      pluginInstance.updateState({
        loading: false,
        error: error.message,
        refreshing: false
      });
    }
    if (eventBus) {
      eventBus.emit("library:refresh:error", {
        error: error.message,
        reason,
        timestamp: Date.now(),
        source: "library-display-symphony"
      });
    }
    return {
      success: false,
      error: error.message
    };
  }
};
