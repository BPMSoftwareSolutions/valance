var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var stdin_exports = {};
__export(stdin_exports, {
  CIAPlugin: () => CIAPlugin,
  JSON_COMPONENT_ERROR_SEQUENCE: () => import_sequence.JSON_COMPONENT_ERROR_SEQUENCE,
  JSON_COMPONENT_LOADING_SEQUENCE: () => import_sequence.JSON_COMPONENT_LOADING_SEQUENCE,
  PLUGIN_INFO: () => PLUGIN_INFO,
  default: () => stdin_default,
  handleComponentLoadingCompleted: () => import_onLoadComplete.default,
  handleComponentLoadingError: () => import_onLoadError.default,
  handleComponentLoadingProgress: () => import_onLoadProgress.default,
  handleComponentLoadingStarted: () => import_onLoadStart.default,
  processComponentLoading: () => import_logic.processComponentLoading,
  sequence: () => import_sequence2.JSON_COMPONENT_LOADING_SEQUENCE,
  startJsonComponentErrorFlow: () => import_sequence.startJsonComponentErrorFlow,
  startJsonComponentLoadingFlow: () => import_sequence.startJsonComponentLoadingFlow,
  useJsonComponentLoader: () => import_hooks.useJsonComponentLoader,
  useJsonComponentLoaderDefault: () => import_hooks.default,
  validateComponentStructure: () => import_logic.validateComponentStructure
});
module.exports = __toCommonJS(stdin_exports);
var import_sequence = require("./sequence.js");
var import_sequence2 = require("./sequence.js");
var import_onLoadStart = __toESM(require("./handlers/onLoadStart.js"));
var import_onLoadProgress = __toESM(require("./handlers/onLoadProgress.js"));
var import_onLoadComplete = __toESM(require("./handlers/onLoadComplete.js"));
var import_onLoadError = __toESM(require("./handlers/onLoadError.js"));
var import_logic = require("./logic/index.js");
var import_hooks = __toESM(require("./hooks/index.js"));
const PLUGIN_INFO = {
  id: "JsonLoader.json-component-symphony",
  name: "JSON Component Loading Symphony No. 1",
  version: "1.0.0",
  description: "Component Loading - Dynamic JSON component loading and error handling",
  category: "component-operations",
  type: "symphony-plugin"
};
const CIAPlugin = {
  mount: (conductor, eventBus) => {
    console.log("\u{1F3BC} JsonLoader Plugin: Mounting...");
    try {
      conductor.registerSequence(
        import_sequence.JSON_COMPONENT_LOADING_SEQUENCE
      );
      conductor.registerSequence(import_sequence.JSON_COMPONENT_ERROR_SEQUENCE);
      eventBus.subscribe("component:load:start", (data) => {
        import_onLoadStart.default(data, { eventBus, conductor });
      });
      eventBus.subscribe(
        "component:load:progress",
        import_onLoadProgress.default
      );
      eventBus.subscribe(
        "component:load:complete",
        import_onLoadComplete.default
      );
      eventBus.subscribe("component:load:error", import_onLoadError.default);
      console.log("\u2705 JsonLoader Plugin: Mounted successfully");
      return true;
    } catch (error) {
      console.error("\u{1F6A8} JsonLoader Plugin: Mount failed:", error);
      return false;
    }
  },
  unmount: (conductor, eventBus) => {
    console.log("\u{1F3BC} JsonLoader Plugin: Unmounting...");
    try {
      eventBus.unsubscribe("component:load:start", import_onLoadStart.default);
      eventBus.unsubscribe(
        "component:load:progress",
        import_onLoadProgress.default
      );
      eventBus.unsubscribe(
        "component:load:complete",
        import_onLoadComplete.default
      );
      eventBus.unsubscribe("component:load:error", import_onLoadError.default);
      console.log("\u2705 JsonLoader Plugin: Unmounted successfully");
      return true;
    } catch (error) {
      console.error("\u{1F6A8} JsonLoader Plugin: Unmount failed:", error);
      return false;
    }
  }
};
var stdin_default = CIAPlugin;
