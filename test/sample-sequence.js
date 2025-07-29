export const sequence = {
  name: "sample-workflow",
  description: "A sample sequence for testing validation",
  steps: [
    {
      type: "action",
      name: "initialize",
      handler: "initializeHandler"
    },
    {
      type: "validation", 
      name: "validate-input",
      handler: "validateInputHandler"
    },
    {
      type: "action",
      name: "process",
      handler: "processHandler"
    }
  ]
};