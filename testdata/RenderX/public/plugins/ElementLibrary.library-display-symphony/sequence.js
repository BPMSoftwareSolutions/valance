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
  ElementLibraryDisplaySequence: () => ElementLibraryDisplaySequence
});
module.exports = __toCommonJS(stdin_exports);
const ElementLibraryDisplaySequence = {
  name: "Element Library Display Symphony No. 12",
  key: "C Major",
  tempo: 120,
  timeSignature: "4/4",
  movements: [
    {
      name: "Library Initialization Movement",
      description: "Initialize component library display",
      beats: [
        {
          beat: 1,
          event: "library-display-init",
          title: "Initialize Library Display",
          handler: "onLibraryInit",
          timing: "IMMEDIATE"
        },
        {
          beat: 2,
          event: "components-request",
          title: "Request Component Data",
          handler: "onComponentsRequest",
          timing: "IMMEDIATE"
        },
        {
          beat: 3,
          event: "library-render-ready",
          title: "Prepare Library Rendering",
          handler: "onRenderReady",
          timing: "IMMEDIATE"
        }
      ]
    },
    {
      name: "Component Display Movement",
      description: "Render and organize components",
      beats: [
        {
          beat: 4,
          event: "components-categorize",
          title: "Categorize Components",
          handler: "onComponentsCategorize",
          timing: "IMMEDIATE"
        },
        {
          beat: 5,
          event: "library-display-render",
          title: "Render Component Library",
          handler: "onLibraryRender",
          timing: "IMMEDIATE"
        },
        {
          beat: 6,
          event: "library-display-complete",
          title: "Library Display Complete",
          handler: "onDisplayComplete",
          timing: "IMMEDIATE"
        }
      ]
    },
    {
      name: "Interaction Management Movement",
      description: "Handle user interactions with library",
      beats: [
        {
          beat: 7,
          event: "library-search-ready",
          title: "Enable Search Functionality",
          handler: "onSearchReady",
          timing: "IMMEDIATE"
        },
        {
          beat: 8,
          event: "library-filter-ready",
          title: "Enable Category Filtering",
          handler: "onFilterReady",
          timing: "IMMEDIATE"
        },
        {
          beat: 9,
          event: "library-interaction-complete",
          title: "Library Fully Interactive",
          handler: "onInteractionComplete",
          timing: "IMMEDIATE"
        }
      ]
    }
  ],
  // Sequence triggers
  triggers: {
    onLibraryDisplayInit: {
      description: "Initialize element library display",
      requiredData: ["mountPoint"],
      optionalData: ["theme", "layout"]
    },
    onComponentsLoaded: {
      description: "Handle loaded components data",
      requiredData: ["components"],
      optionalData: ["categories", "metadata"]
    },
    onLibrarySearch: {
      description: "Handle library search query",
      requiredData: ["query"],
      optionalData: ["filters", "scope"]
    },
    onCategoryFilter: {
      description: "Handle category filtering",
      requiredData: ["category"],
      optionalData: ["includeEmpty", "sortOrder"]
    }
  },
  // Error handling
  errorHandling: {
    onComponentLoadError: {
      strategy: "graceful-degradation",
      fallback: "show-error-message",
      retry: true,
      maxRetries: 3
    },
    onRenderError: {
      strategy: "fallback-component",
      fallback: "basic-list-view",
      isolate: true
    }
  },
  // Performance optimization
  performance: {
    lazyLoad: true,
    virtualScrolling: false,
    // Not needed for typical component counts
    debounceSearch: 300,
    cacheResults: true
  }
};
