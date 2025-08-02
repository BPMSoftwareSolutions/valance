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
  handleLibraryDragStart: () => handleLibraryDragStart
});
module.exports = __toCommonJS(stdin_exports);
var import_dropValidation = require("../logic/dropValidation");
const handleLibraryDragStart = (data) => {
  console.log("\u{1F3BC} LibraryDrop Handler: Library Drag Start", data);
  try {
    const { dragData, dropCoordinates, containerContext, libraryElement } = data;
    if (!dragData || !dragData.type || !dragData.componentId) {
      console.error("\u{1F3BC} LibraryDrop Handler: Invalid drag data for library drop:", dragData);
      return {
        success: false,
        error: "Invalid drag data",
        validation: {
          dragData: false,
          dropCoordinates: !!dropCoordinates,
          containerContext: !!containerContext
        }
      };
    }
    if (!dropCoordinates || typeof dropCoordinates.x !== "number" || typeof dropCoordinates.y !== "number") {
      console.error("\u{1F3BC} LibraryDrop Handler: Invalid drop coordinates for library drop:", dropCoordinates);
      return {
        success: false,
        error: "Invalid drop coordinates",
        validation: {
          dragData: true,
          dropCoordinates: false,
          containerContext: !!containerContext
        }
      };
    }
    const result = (0, import_dropValidation.validateDropContext)(dragData, dropCoordinates, containerContext);
    if (result) {
      console.log("\u{1F3BC} LibraryDrop Handler: Library Drag Start completed successfully");
      return {
        success: true,
        dragData,
        dropCoordinates,
        containerContext,
        libraryElement,
        validation: {
          dragData: true,
          dropCoordinates: true,
          containerContext: !!containerContext
        }
      };
    }
    return {
      success: false,
      error: "Drop context validation failed"
    };
  } catch (error) {
    console.error("\u{1F3BC} LibraryDrop Handler: Library Drag Start failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};
var stdin_default = handleLibraryDragStart;
