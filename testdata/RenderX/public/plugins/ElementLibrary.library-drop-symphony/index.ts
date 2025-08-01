/**
 * Canvas Library Drop Symphony No. 33 Plugin
 * Entry Point and Exports
 */

// Core sequence and flow
export {
  CANVAS_LIBRARY_DROP_SEQUENCE,
  startCanvasLibraryDropFlow,
} from "./sequence";

// Individual handlers
export { default as handleLibraryDragStart } from "./handlers/onLibraryDragStart";
export { default as handleCanvasDropValidation } from "./handlers/onCanvasDrop";
export {
  default as handleCanvasElementCreated,
  handleCanvasElementPositioned,
} from "./handlers/onElementCreate";

// Business logic
export { validateDropContext } from "./logic/dropValidation";

// React hooks
export {
  useCanvasLibraryDrop,
  default as useCanvasLibraryDropDefault,
} from "./hooks";

// Plugin metadata
export const PLUGIN_INFO = {
  id: "LibraryDrop.library-drop-symphony",
  name: "Canvas Library Drop Symphony No. 33",
  version: "1.0.0",
  description: "Element Creation - Dynamic library element drop sequence",
  category: "canvas-operations",
  type: "symphony-plugin",
};

// CIA Plugin Interface
export const CIAPlugin = {
  mount: (conductor, eventBus) => {
    console.log("🎼 LibraryDrop Plugin: Mounting...");

    try {
      // Register the sequence
      conductor.registerSequence(CANVAS_LIBRARY_DROP_SEQUENCE);

      // Register handlers with event bus
      eventBus.subscribe("library:drag:start", handleLibraryDragStart);
      eventBus.subscribe("canvas:drop:validation", handleCanvasDropValidation);
      eventBus.subscribe("canvas:element:create", handleCanvasElementCreated);
      eventBus.subscribe(
        "canvas:element:position",
        handleCanvasElementPositioned
      );

      console.log("✅ LibraryDrop Plugin: Mounted successfully");
      return true;
    } catch (error) {
      console.error("🚨 LibraryDrop Plugin: Mount failed:", error);
      return false;
    }
  },

  unmount: (conductor: any, eventBus: any) => {
    console.log("🎼 LibraryDrop Plugin: Unmounting...");

    try {
      // Unsubscribe from events
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

      console.log("✅ LibraryDrop Plugin: Unmounted successfully");
      return true;
    } catch (error) {
      console.error("🚨 LibraryDrop Plugin: Unmount failed:", error);
      return false;
    }
  },
};

export default CIAPlugin;
