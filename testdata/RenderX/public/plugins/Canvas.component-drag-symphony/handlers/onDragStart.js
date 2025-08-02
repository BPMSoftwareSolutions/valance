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
  handleCanvasDragOver: () => handleCanvasDragOver
});
module.exports = __toCommonJS(stdin_exports);
var import_dragValidation = require("../logic/dragValidation");
const handleCanvasDragOver = (data) => {
  console.log("\u{1F3BC} ComponentDrag Handler: Canvas Drag Over", data);
  try {
    const { elementId, changes, source, elements } = data;
    if (!elementId || !changes || !source) {
      console.log("\u{1F3BC} ComponentDrag Handler: Canvas Drag Over - Not a component drag event, skipping");
      return true;
    }
    const result = (0, import_dragValidation.validateDragContext)(elementId, changes, source, elements);
    console.log("\u{1F3BC} ComponentDrag Handler: Canvas Drag Over completed successfully");
    return result;
  } catch (error) {
    console.error("\u{1F3BC} ComponentDrag Handler: Canvas Drag Over failed:", error);
    return false;
  }
};
var stdin_default = handleCanvasDragOver;
