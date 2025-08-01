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
  processElementSelection: () => processElementSelection
});
module.exports = __toCommonJS(stdin_exports);
const processElementSelection = (element, selectionType, currentSelection, clearPrevious) => {
  console.log("\u{1F3AF} ElementSelection Logic: Process Element Selection");
  try {
    let updatedSelection = [...currentSelection];
    if (clearPrevious || selectionType === "single") {
      updatedSelection = [element];
    } else if (selectionType === "multi") {
      const existingIndex = updatedSelection.findIndex((el) => el.id === element.id);
      if (existingIndex >= 0) {
        updatedSelection.splice(existingIndex, 1);
      } else {
        updatedSelection.push(element);
      }
    } else if (selectionType === "range") {
      updatedSelection.push(element);
    }
    console.log("\u{1F3AF} ElementSelection Logic: Element selection processing successful");
    return {
      success: true,
      updatedSelection
    };
  } catch (error) {
    console.error("\u{1F3AF} ElementSelection Logic: Element selection processing failed:", error);
    return {
      success: false,
      updatedSelection: currentSelection,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};
