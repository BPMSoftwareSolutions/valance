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
  CANVAS_LIBRARY_DROP_SEQUENCE: () => import_sequence.CANVAS_LIBRARY_DROP_SEQUENCE,
  sequence: () => import_sequence.CANVAS_LIBRARY_DROP_SEQUENCE,
  CIAPlugin: () => CIAPlugin,
  PLUGIN_INFO: () => PLUGIN_INFO,
  default: () => stdin_default,
  handleCanvasDropValidation: () => import_onCanvasDrop.default,
  handleCanvasElementCreated: () => import_onElementCreate.default,
  handleCanvasElementPositioned: () => import_onElementCreate.handleCanvasElementPositioned,
  handleLibraryDragStart: () => import_onLibraryDragStart.default,
  startCanvasLibraryDropFlow: () => import_sequence.startCanvasLibraryDropFlow,
  useCanvasLibraryDrop: () => import_hooks.useCanvasLibraryDrop,
  useCanvasLibraryDropDefault: () => import_hooks.default,
  validateDropContext: () => import_dropValidation.validateDropContext
});
module.exports = __toCommonJS(stdin_exports);
var import_sequence = require("./sequence.ts");
var import_onLibraryDragStart = __toESM(
  require("./handlers/onLibraryDragStart.ts")
);
var import_onCanvasDrop = __toESM(require("./handlers/onCanvasDrop.ts"));
var import_onElementCreate = __toESM(require("./handlers/onElementCreate.ts"));
var import_dropValidation = require("./logic/dropValidation.ts");
var import_hooks = __toESM(require("./hooks/index.ts"));
const PLUGIN_INFO = {
  id: "LibraryDrop.library-drop-symphony",
  name: "Canvas Library Drop Symphony No. 33",
  version: "1.0.0",
  description: "Element Creation - Dynamic library element drop sequence",
  category: "canvas-operations",
  type: "symphony-plugin"
};
const CIAPlugin = {
  mount: (conductor, eventBus) => {
    console.log("\u{1F3BC} LibraryDrop Plugin: Mounting...");
    try {
      conductor.registerSequence(CANVAS_LIBRARY_DROP_SEQUENCE);
      eventBus.subscribe("library:drag:start", handleLibraryDragStart);
      eventBus.subscribe("canvas:drop:validation", handleCanvasDropValidation);
      eventBus.subscribe("canvas:element:create", handleCanvasElementCreated);
      eventBus.subscribe(
        "canvas:element:position",
        handleCanvasElementPositioned
      );
      console.log("\u2705 LibraryDrop Plugin: Mounted successfully");
      return true;
    } catch (error) {
      console.error("\u{1F6A8} LibraryDrop Plugin: Mount failed:", error);
      return false;
    }
  },
  unmount: (conductor, eventBus) => {
    console.log("\u{1F3BC} LibraryDrop Plugin: Unmounting...");
    try {
      eventBus.unsubscribe("library:drag:start", handleLibraryDragStart);
      eventBus.unsubscribe(
        "canvas:drop:validation",
        handleCanvasDropValidation
      );
      eventBus.unsubscribe("canvas:element:create", handleCanvasElementCreated);
      eventBus.unsubscribe(
        "canvas:element:position",
        handleCanvasElementPositioned
      );
      console.log("\u2705 LibraryDrop Plugin: Unmounted successfully");
      return true;
    } catch (error) {
      console.error("\u{1F6A8} LibraryDrop Plugin: Unmount failed:", error);
      return false;
    }
  }
};
var stdin_default = CIAPlugin;
