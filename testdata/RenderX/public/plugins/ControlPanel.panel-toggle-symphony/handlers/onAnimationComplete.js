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
  default: () => handlePanelAnimationStart,
  handlePanelAnimationComplete: () => handlePanelAnimationComplete,
  handlePanelAnimationStart: () => handlePanelAnimationStart
});
module.exports = __toCommonJS(stdin_exports);
const handlePanelAnimationStart = (data) => {
  console.log("\u{1F3BC} PanelToggle Handler: Panel Animation Start", data);
  try {
    return { success: true, animationStarted: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
};
const handlePanelAnimationComplete = (data) => {
  console.log("\u{1F3BC} PanelToggle Handler: Panel Animation Complete", data);
  try {
    return { success: true, animationCompleted: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
};
