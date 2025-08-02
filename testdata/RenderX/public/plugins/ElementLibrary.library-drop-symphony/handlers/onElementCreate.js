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
  default: () => handleCanvasElementCreated,
  handleCanvasElementCreated: () => handleCanvasElementCreated,
  handleCanvasElementPositioned: () => handleCanvasElementPositioned
});
module.exports = __toCommonJS(stdin_exports);
const handleCanvasElementCreated = (data) => {
  console.log("\u{1F3BC} LibraryDrop Handler: Canvas Element Created", data);
  try {
    return { success: true, created: true };
  } catch (error) {
    console.error("\u{1F3BC} LibraryDrop Handler: Canvas Element Created failed:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
};
const handleCanvasElementPositioned = (data) => {
  console.log("\u{1F3BC} LibraryDrop Handler: Canvas Element Positioned", data);
  try {
    return { success: true, positioned: true };
  } catch (error) {
    console.error("\u{1F3BC} LibraryDrop Handler: Canvas Element Positioned failed:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
};
