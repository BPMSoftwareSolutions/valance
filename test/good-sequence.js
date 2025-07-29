export const sequence = {
  name: "Canvas Component Symphony No. 1",
  description: "A comprehensive sequence that demonstrates proper tempo, key signature, and movement structure with well-defined beats and measures",
  key: "C Major",
  tempo: 120,
  timeSignature: "4/4",
  movements: [
    {
      name: "Initialization Movement",
      measures: [
        {
          beat: 1,
          event: "CANVAS_INIT",
          title: "Initialize Canvas",
          description: "Set up the canvas component with default properties",
          dependencies: []
        },
        {
          beat: 2,
          event: "STATE_SETUP",
          title: "Setup State",
          description: "Initialize component state and event handlers",
          dependencies: [1]
        },
        {
          beat: 3,
          event: "RENDER_PREP",
          title: "Prepare Rendering",
          description: "Prepare the rendering context and resources",
          dependencies: [2]
        }
      ]
    },
    {
      name: "Processing Movement",
      measures: [
        {
          beat: 1,
          event: "DATA_LOAD",
          title: "Load Data",
          description: "Load required data for the canvas component",
          dependencies: []
        },
        {
          beat: 2,
          event: "TRANSFORM_DATA",
          title: "Transform Data",
          description: "Transform loaded data into renderable format",
          dependencies: [1]
        }
      ]
    }
  ]
};
