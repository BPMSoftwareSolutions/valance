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
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var stdin_exports = {};
__export(stdin_exports, {
  default: () => stdin_default,
  handleComponentLoadingCompleted: () => handleComponentLoadingCompleted
});
module.exports = __toCommonJS(stdin_exports);
const handleComponentLoadingCompleted = (data, context) => {
  console.log(
    "\u{1F3BC} JsonLoader Handler: Component Loading Completed",
    data
  );
  try {
    const { eventBus } = context || {};
    if (eventBus && data.components) {
      console.log(
        "\u{1F3BC} JsonLoader: Emitting components:loaded event with",
        data.components.length,
        "components"
      );
      eventBus.emit("components:loaded", {
        components: data.components,
        count: data.count || data.components.length,
        source: data.source || "json-loader",
        timestamp: data.timestamp || Date.now()
      });
    } else {
      console.warn(
        "\u26A0\uFE0F JsonLoader: Cannot emit components:loaded - missing eventBus or components data"
      );
    }
    return { success: true, completed: true };
  } catch (error) {
    console.error(
      "\u274C JsonLoader Handler: Failed to emit components:loaded",
      error
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};
var stdin_default = handleComponentLoadingCompleted;
