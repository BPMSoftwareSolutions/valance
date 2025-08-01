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
  useJsonComponentLoader: () => useJsonComponentLoader
});
module.exports = __toCommonJS(stdin_exports);
var import_react = require("react");
const useJsonComponentLoader = ({ conductor, onLoadComplete, onLoadError }) => {
  const startLoadingSequence = (0, import_react.useCallback)((componentFiles) => {
    if (!conductor) {
      console.warn("\u{1F3BC} JsonLoader Hook: Conductor not available");
      return null;
    }
    return conductor.startSequence("JSON Component Loading Symphony No. 1", {
      componentFiles,
      timestamp: /* @__PURE__ */ new Date(),
      sequenceId: `json-loading-${Date.now()}`
    });
  }, [conductor]);
  const loadComponents = (0, import_react.useCallback)((componentFiles) => {
    console.log("\u{1F3BC} JsonLoader Hook: Load Components", { count: componentFiles.length });
    const sequenceId = startLoadingSequence(componentFiles);
    setTimeout(() => {
      if (onLoadComplete) {
        onLoadComplete(componentFiles);
      }
    }, 100);
    return sequenceId;
  }, [startLoadingSequence, onLoadComplete]);
  return {
    startLoadingSequence,
    loadComponents
  };
};
var stdin_default = useJsonComponentLoader;
