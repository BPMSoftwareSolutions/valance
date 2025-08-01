// TypeScript test plugin
interface PluginInfo {
  name: string;
  version: string;
}

interface TestPlugin {
  info: PluginInfo;
  init(): string;
  getMessage(): string;
  calculate(a: number, b: number): number;
}

export const typescriptPlugin: TestPlugin = {
  info: {
    name: "TypeScript Test Plugin",
    version: "1.0.0"
  },
  
  init(): string {
    console.log("✅ TypeScript plugin initialized successfully!");
    return "Hello from TypeScript plugin!";
  },
  
  getMessage(): string {
    return "This is a TypeScript plugin with type safety!";
  },
  
  calculate(a: number, b: number): number {
    return a + b;
  }
};

export default typescriptPlugin;
