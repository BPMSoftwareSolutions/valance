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
  canElementBeDragged: () => canElementBeDragged,
  validateDragBoundaries: () => validateDragBoundaries,
  validateDragContext: () => validateDragContext
});
module.exports = __toCommonJS(stdin_exports);
const validateDragContext = (elementId, changes, source, elements) => {
  console.log("\u{1F3AF} ComponentDrag Logic: Validate Drag Context");
  try {
    const element = elements.find((el) => el.id === elementId);
    if (!element) {
      console.warn("\u{1F3AF} ComponentDrag Logic: Element not found for drag validation:", elementId);
      return false;
    }
    if (source !== "canvas-drag" && source !== "component-drag") {
      console.log("\u{1F3AF} ComponentDrag Logic: Invalid drag source:", source);
      return false;
    }
    if (!changes || typeof changes !== "object") {
      console.warn("\u{1F3AF} ComponentDrag Logic: Invalid changes object:", changes);
      return false;
    }
    if (element.locked || element.readonly) {
      console.warn("\u{1F3AF} ComponentDrag Logic: Element is locked or readonly:", elementId);
      return false;
    }
    if (changes.x !== void 0 && (typeof changes.x !== "number" || isNaN(changes.x))) {
      console.warn("\u{1F3AF} ComponentDrag Logic: Invalid x position:", changes.x);
      return false;
    }
    if (changes.y !== void 0 && (typeof changes.y !== "number" || isNaN(changes.y))) {
      console.warn("\u{1F3AF} ComponentDrag Logic: Invalid y position:", changes.y);
      return false;
    }
    console.log("\u{1F3AF} ComponentDrag Logic: Drag context validation successful");
    return true;
  } catch (error) {
    console.error("\u{1F3AF} ComponentDrag Logic: Drag context validation failed:", error);
    return false;
  }
};
const canElementBeDragged = (element) => {
  return !element.locked && !element.readonly && element.type !== "background";
};
const validateDragBoundaries = (element, newX, newY, canvasBounds) => {
  if (!canvasBounds)
    return true;
  const elementRight = newX + (element.width || 0);
  const elementBottom = newY + (element.height || 0);
  return newX >= 0 && newY >= 0 && elementRight <= canvasBounds.width && elementBottom <= canvasBounds.height;
};
