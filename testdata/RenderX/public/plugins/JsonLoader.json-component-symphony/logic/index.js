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
  processComponentLoading: () => processComponentLoading,
  validateComponentStructure: () => validateComponentStructure
});
module.exports = __toCommonJS(stdin_exports);
const validateComponentStructure = (component) => {
  console.log("\u{1F3AF} JsonLoader Logic: Validate Component Structure");
  try {
    return component && component.id && component.type;
  } catch (error) {
    console.error("\u{1F3AF} JsonLoader Logic: Component validation failed:", error);
    return false;
  }
};
const processComponentLoading = (componentFiles) => {
  console.log("\u{1F3AF} JsonLoader Logic: Process Component Loading");
  try {
    return {
      success: true,
      processedCount: componentFiles.length,
      components: componentFiles
    };
  } catch (error) {
    console.error("\u{1F3AF} JsonLoader Logic: Component processing failed:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
};
