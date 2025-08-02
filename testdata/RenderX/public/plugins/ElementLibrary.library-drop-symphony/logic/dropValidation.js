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
  validateDropContext: () => validateDropContext
});
module.exports = __toCommonJS(stdin_exports);
const validateDropContext = (dragData, dropCoordinates, containerContext) => {
  console.log("\u{1F3AF} LibraryDrop Logic: Validate Drop Context");
  try {
    if (!dragData || !dragData.type || !dragData.componentId) {
      console.warn("\u{1F3AF} LibraryDrop Logic: Invalid drag data");
      return false;
    }
    if (!dropCoordinates || typeof dropCoordinates.x !== "number" || typeof dropCoordinates.y !== "number") {
      console.warn("\u{1F3AF} LibraryDrop Logic: Invalid drop coordinates");
      return false;
    }
    console.log("\u{1F3AF} LibraryDrop Logic: Drop context validation successful");
    return true;
  } catch (error) {
    console.error("\u{1F3AF} LibraryDrop Logic: Drop context validation failed:", error);
    return false;
  }
};
