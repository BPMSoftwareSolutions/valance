// @agent-context: Sample conductor with intentional issues for CIA validation testing
export class BadConductor {
  private sequences: Map<string, any> = new Map();
  private handlers: Map<string, any> = new Map();

  // BAD: No validation before mounting
  mount(sequence: any, handlers: any) {
    // Missing sequence validation
    // Missing handlers validation
    // No error handling
    
    this.sequences.set(sequence.id, sequence);
    this.handlers.set(sequence.id, handlers);
    
    console.log('Mounted plugin:', sequence.id);
  }

  // BAD: Wrong parameter order
  registerSequence(handlers: any, sequence: any) {
    this.mount(sequence, handlers);
  }

  // BAD: No handler validation before execution
  executeMovement(sequenceId: string, movementLabel: string, data: any) {
    const handlers = this.handlers.get(sequenceId);
    
    // Missing handler existence check
    // Missing movement-to-handler mapping validation
    // No error handling
    
    const handler = handlers[movementLabel];
    return handler(data); // This will crash if handler is undefined
  }

  // BAD: No graceful failure
  loadPlugin(pluginPath: string) {
    // Missing try-catch
    // No error logging
    // No graceful failure
    
    const plugin = require(pluginPath);
    this.mount(plugin.sequence, plugin.handlers);
  }
}
