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
  handleCanvasElementSelected: () => handleCanvasElementSelected
});
module.exports = __toCommonJS(stdin_exports);
var import_selectionValidation = require("../logic/selectionValidation");
const handleCanvasElementSelected = (data) => {
  console.log("\u{1F3BC} ElementSelection Handler: Canvas Element Selected", data);
  try {
    const { element, selectionContext, selectionType = "single", clearPrevious = true } = data;
    if (!element || !element.id || !element.type) {
      console.error("\u{1F3BC} ElementSelection Handler: Invalid element data for selection:", element);
      return {
        success: false,
        error: "Invalid element data",
        validation: {
          element: false,
          selectionContext: !!selectionContext
        }
      };
    }
    const hasSelectionPermission = element.metadata?.selectable !== false;
    if (!hasSelectionPermission) {
      console.warn("\u{1F3BC} ElementSelection Handler: Element is not selectable:", element.id);
      return {
        success: false,
        error: "Element is not selectable",
        validation: {
          element: true,
          selectionContext: !!selectionContext,
          selectable: false
        }
      };
    }
    const result = (0, import_selectionValidation.validateSelectionContext)(element, selectionContext, selectionType);
    if (result) {
      console.log("\u{1F3BC} ElementSelection Handler: Element Selection Detection completed successfully");
      return {
        success: true,
        element,
        selectionType,
        clearPrevious,
        validation: {
          element: true,
          selectionContext: !!selectionContext,
          selectable: true
        }
      };
    }
    return {
      success: false,
      error: "Selection validation failed"
    };
  } catch (error) {
    console.error("\u{1F3BC} ElementSelection Handler: Canvas Element Selected failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};
var stdin_default = handleCanvasElementSelected;
