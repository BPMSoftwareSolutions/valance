// Simple test plugin - no TypeScript, no complex dependencies
export const simplePlugin = {
  name: "Simple Test Plugin",
  version: "1.0.0",
  
  init() {
    console.log("✅ Simple plugin initialized successfully!");
    return "Hello from simple plugin!";
  },
  
  getMessage() {
    return "This is a simple test plugin that works!";
  },
  
  getRandomNumber() {
    return Math.floor(Math.random() * 100);
  }
};

export default simplePlugin;
