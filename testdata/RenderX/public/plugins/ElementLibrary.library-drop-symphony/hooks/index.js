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
  useCanvasLibraryDrop: () => useCanvasLibraryDrop
});
module.exports = __toCommonJS(stdin_exports);
var import_react = require("react");
const useCanvasLibraryDrop = ({ conductor, onElementCreated }) => {
  const startLibraryDropSequence = (0, import_react.useCallback)((libraryElement, dropPosition) => {
    if (!conductor) {
      console.warn("\u{1F3BC} LibraryDrop Hook: Conductor not available");
      return null;
    }
    return conductor.startSequence("Canvas Library Drop Symphony No. 33", {
      libraryElement,
      dropPosition,
      timestamp: /* @__PURE__ */ new Date(),
      sequenceId: `library-drop-${Date.now()}`
    });
  }, [conductor]);
  const handleLibraryDrop = (0, import_react.useCallback)((libraryElement, dropPosition) => {
    console.log("\u{1F3BC} LibraryDrop Hook: Handle Library Drop", { libraryElement, dropPosition });
    const sequenceId = startLibraryDropSequence(libraryElement, dropPosition);
    if (sequenceId && onElementCreated) {
      setTimeout(() => {
        onElementCreated({
          id: `element-${Date.now()}`,
          type: libraryElement.type,
          x: dropPosition.x,
          y: dropPosition.y,
          ...libraryElement
        });
      }, 100);
    }
    return sequenceId;
  }, [startLibraryDropSequence, onElementCreated]);
  return {
    startLibraryDropSequence,
    handleLibraryDrop
  };
};
var stdin_default = useCanvasLibraryDrop;
