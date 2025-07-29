export const symphony = {
  name: "sample-symphony",
  version: "1.0.0",
  description: "A sample symphony for testing plugin validation",
  
  beats: [
    {
      id: "beat1",
      name: "initialization",
      duration: 1000,
      actions: ["setup", "configure"]
    },
    {
      id: "beat2", 
      name: "processing",
      duration: 2000,
      actions: ["process", "validate"]
    },
    {
      id: "beat3",
      name: "completion",
      duration: 500,
      actions: ["cleanup", "finalize"]
    }
  ],
  
  eventMap: {
    "user.login": {
      beat: "beat1",
      handler: "handleUserLogin"
    },
    "data.process": {
      beat: "beat2", 
      handler: "handleDataProcess"
    },
    "system.shutdown": {
      beat: "beat3",
      handler: "handleSystemShutdown"
    }
  }
};
