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
  SelectionValidationRules: () => SelectionValidationRules,
  canElementBeSelected: () => canElementBeSelected,
  getSelectionConstraints: () => getSelectionConstraints,
  validateSelectionContext: () => validateSelectionContext
});
module.exports = __toCommonJS(stdin_exports);
const SelectionValidationRules = {
  /**
   * Validate element selectability
   */
  validateElementSelectability: (element) => {
    const errors = [];
    if (!element) {
      errors.push("Element is required");
      return { isValid: false, errors };
    }
    if (!element.id || typeof element.id !== "string") {
      errors.push("Element must have a valid ID");
    }
    if (!element.type || typeof element.type !== "string") {
      errors.push("Element must have a valid type");
    }
    if (element.metadata?.selectable === false) {
      errors.push("Element is marked as non-selectable");
    }
    if (element.state === "locked") {
      errors.push("Element is locked and cannot be selected");
    }
    return { isValid: errors.length === 0, errors };
  },
  /**
   * Validate selection context
   */
  validateSelectionContext: (context) => {
    const errors = [];
    if (!context) {
      return { isValid: true, errors };
    }
    if (context.canvasId && typeof context.canvasId !== "string") {
      errors.push("Canvas ID must be a string");
    }
    if (context.multiSelect !== void 0 && typeof context.multiSelect !== "boolean") {
      errors.push("Multi-select flag must be a boolean");
    }
    if (context.rangeSelect !== void 0 && typeof context.rangeSelect !== "boolean") {
      errors.push("Range-select flag must be a boolean");
    }
    return { isValid: errors.length === 0, errors };
  }
};
const validateSelectionContext = (element, selectionContext, selectionType = "single") => {
  console.log("\u{1F3AF} ElementSelection Logic: Validate Selection Context");
  try {
    const elementValidation = SelectionValidationRules.validateElementSelectability(element);
    if (!elementValidation.isValid) {
      console.warn("\u{1F3AF} ElementSelection Logic: Element validation failed:", elementValidation.errors);
      return false;
    }
    const contextValidation = SelectionValidationRules.validateSelectionContext(selectionContext);
    if (!contextValidation.isValid) {
      console.warn("\u{1F3AF} ElementSelection Logic: Context validation failed:", contextValidation.errors);
      return false;
    }
    if (selectionType === "multi" && selectionContext?.multiSelect === false) {
      console.warn("\u{1F3AF} ElementSelection Logic: Multi-select requested but not allowed in context");
      return false;
    }
    if (selectionType === "range" && selectionContext?.rangeSelect === false) {
      console.warn("\u{1F3AF} ElementSelection Logic: Range-select requested but not allowed in context");
      return false;
    }
    console.log("\u{1F3AF} ElementSelection Logic: Selection context validation successful");
    return true;
  } catch (error) {
    console.error("\u{1F3AF} ElementSelection Logic: Selection context validation failed:", error);
    return false;
  }
};
const canElementBeSelected = (element) => {
  const validation = SelectionValidationRules.validateElementSelectability(element);
  return validation.isValid;
};
const getSelectionConstraints = (element) => {
  const validation = SelectionValidationRules.validateElementSelectability(element);
  return {
    canSelect: validation.isValid,
    canMultiSelect: validation.isValid && element.metadata?.multiSelectable !== false,
    canRangeSelect: validation.isValid && element.metadata?.rangeSelectable !== false,
    reasons: validation.errors
  };
};
