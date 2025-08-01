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
  applyDragFeedback: () => applyDragFeedback,
  coordinateDragState: () => coordinateDragState,
  generateTransform: () => generateTransform,
  syncDragChanges: () => syncDragChanges
});
module.exports = __toCommonJS(stdin_exports);
const coordinateDragState = (elementId, changes, source, elements, dragData) => {
  console.log("\u{1F3AF} ComponentDrag Logic: Coordinate Drag State");
  try {
    const element = elements.find((el) => el.id === elementId);
    if (!element) {
      console.warn("\u{1F3AF} ComponentDrag Logic: Element not found for drop coordination:", elementId);
      return false;
    }
    const newX = changes.x !== void 0 ? changes.x : element.x || 0;
    const newY = changes.y !== void 0 ? changes.y : element.y || 0;
    if (newX < 0 || newY < 0) {
      console.warn("\u{1F3AF} ComponentDrag Logic: Invalid drop position (negative coordinates)");
      return false;
    }
    const conflicts = elements.filter(
      (el) => el.id !== elementId && el.x === newX && el.y === newY
    );
    if (conflicts.length > 0) {
      console.warn("\u{1F3AF} ComponentDrag Logic: Drop position conflicts with existing elements");
    }
    if (dragData) {
      dragData.finalPosition = { x: newX, y: newY };
      dragData.dropValidated = true;
      dragData.timestamp = /* @__PURE__ */ new Date();
    }
    console.log("\u{1F3AF} ComponentDrag Logic: Drag state coordination successful");
    return true;
  } catch (error) {
    console.error("\u{1F3AF} ComponentDrag Logic: Drag state coordination failed:", error);
    return false;
  }
};
const syncDragChanges = (elementId, changes, source, elements, capturedElement, syncElementCSS) => {
  console.log("\u{1F3AF} ComponentDrag Logic: Sync Drag Changes");
  try {
    const element = elements.find((el) => el.id === elementId);
    if (!element) {
      console.warn("\u{1F3AF} ComponentDrag Logic: Element not found for CSS sync:", elementId);
      return false;
    }
    const cssData = {};
    if (changes.x !== void 0) {
      cssData.left = `${changes.x}px`;
      cssData.transform = cssData.transform || "";
      cssData.transform += ` translateX(${changes.x}px)`;
    }
    if (changes.y !== void 0) {
      cssData.top = `${changes.y}px`;
      cssData.transform = cssData.transform || "";
      cssData.transform += ` translateY(${changes.y}px)`;
    }
    if (changes.width !== void 0) {
      cssData.width = `${changes.width}px`;
    }
    if (changes.height !== void 0) {
      cssData.height = `${changes.height}px`;
    }
    if (changes.rotation !== void 0) {
      cssData.transform = cssData.transform || "";
      cssData.transform += ` rotate(${changes.rotation}deg)`;
    }
    if (cssData.transform) {
      cssData.transform = cssData.transform.trim();
    }
    if (syncElementCSS && Object.keys(cssData).length > 0) {
      syncElementCSS(element, cssData);
      console.log("\u{1F3AF} ComponentDrag Logic: CSS synchronization applied");
    }
    if (capturedElement) {
      Object.assign(capturedElement, changes);
    }
    console.log("\u{1F3AF} ComponentDrag Logic: Drag changes sync successful");
    return true;
  } catch (error) {
    console.error("\u{1F3AF} ComponentDrag Logic: Drag changes sync failed:", error);
    return false;
  }
};
const generateTransform = (element) => {
  const transforms = [];
  if (element.x !== void 0 && element.y !== void 0) {
    transforms.push(`translate(${element.x}px, ${element.y}px)`);
  }
  if (element.rotation !== void 0) {
    transforms.push(`rotate(${element.rotation}deg)`);
  }
  if (element.scaleX !== void 0 || element.scaleY !== void 0) {
    const scaleX = element.scaleX || 1;
    const scaleY = element.scaleY || 1;
    transforms.push(`scale(${scaleX}, ${scaleY})`);
  }
  return transforms.join(" ");
};
const applyDragFeedback = (element, isDragging) => {
  return {
    opacity: isDragging ? 0.7 : 1,
    cursor: isDragging ? "grabbing" : "grab",
    zIndex: isDragging ? 1e3 : element.zIndex || 1,
    boxShadow: isDragging ? "0 4px 8px rgba(0,0,0,0.2)" : "none"
  };
};
