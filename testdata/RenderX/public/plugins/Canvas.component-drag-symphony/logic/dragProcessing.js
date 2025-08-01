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
  calculateElementBounds: () => calculateElementBounds,
  checkElementCollisions: () => checkElementCollisions,
  processElementDrag: () => processElementDrag
});
module.exports = __toCommonJS(stdin_exports);
const snapToGrid = (position, gridSize = 20) => {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize
  };
};
const processElementDrag = (elementId, changes, source, elements, setElements) => {
  console.log("\u{1F3AF} ComponentDrag Logic: Process Element Drag");
  try {
    const element = elements.find((el) => el.id === elementId);
    if (!element) {
      console.warn("\u{1F3AF} ComponentDrag Logic: Element not found for drag processing:", elementId);
      return false;
    }
    let newX = changes.x !== void 0 ? changes.x : element.x || 0;
    let newY = changes.y !== void 0 ? changes.y : element.y || 0;
    if (changes.snapToGrid) {
      const snapped = snapToGrid({ x: newX, y: newY }, changes.gridSize || 20);
      newX = snapped.x;
      newY = snapped.y;
    }
    const updatedElement = { ...element };
    if (element.type === "line") {
      const deltaX = newX - (element.x1 || 0);
      const deltaY = newY - (element.y1 || 0);
      updatedElement.x1 = newX;
      updatedElement.y1 = newY;
      updatedElement.x2 = (element.x2 || 0) + deltaX;
      updatedElement.y2 = (element.y2 || 0) + deltaY;
    } else {
      updatedElement.x = newX;
      updatedElement.y = newY;
    }
    if (setElements) {
      setElements(
        (prevElements) => prevElements.map(
          (el) => el.id === elementId ? updatedElement : el
        )
      );
    }
    console.log("\u{1F3AF} ComponentDrag Logic: Element drag processing successful");
    return true;
  } catch (error) {
    console.error("\u{1F3AF} ComponentDrag Logic: Element drag processing failed:", error);
    return false;
  }
};
const calculateElementBounds = (element) => {
  if (element.type === "line") {
    return {
      left: Math.min(element.x1 || 0, element.x2 || 0),
      top: Math.min(element.y1 || 0, element.y2 || 0),
      right: Math.max(element.x1 || 0, element.x2 || 0),
      bottom: Math.max(element.y1 || 0, element.y2 || 0)
    };
  }
  return {
    left: element.x || 0,
    top: element.y || 0,
    right: (element.x || 0) + (element.width || 0),
    bottom: (element.y || 0) + (element.height || 0)
  };
};
const checkElementCollisions = (draggedElement, allElements) => {
  const draggedBounds = calculateElementBounds(draggedElement);
  const collisions = [];
  for (const element of allElements) {
    if (element.id === draggedElement.id)
      continue;
    const elementBounds = calculateElementBounds(element);
    if (draggedBounds.left < elementBounds.right && draggedBounds.right > elementBounds.left && draggedBounds.top < elementBounds.bottom && draggedBounds.bottom > elementBounds.top) {
      collisions.push(element);
    }
  }
  return collisions;
};
