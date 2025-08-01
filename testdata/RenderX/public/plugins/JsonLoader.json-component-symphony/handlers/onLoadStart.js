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
  handleComponentLoadingStarted: () => handleComponentLoadingStarted
});
module.exports = __toCommonJS(stdin_exports);
const handleComponentLoadingStarted = (data) => {
  console.log("\u{1F3BC} JsonLoader Handler: Component Loading Started", data);
  try {
    return { success: true, started: true };
  } catch (error) {
    console.error("\u{1F3BC} JsonLoader Handler: Component Loading Started failed:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
};
var stdin_default = handleComponentLoadingStarted;
