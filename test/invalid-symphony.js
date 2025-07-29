export const symphony = {
  name: "invalid-symphony",
  description: "A symphony missing required elements",
  
  // Missing beats: property
  
  eventMap: {
    "user.login": {
      handler: "handleUserLogin"
    }
  }
};
