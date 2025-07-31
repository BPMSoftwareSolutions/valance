// @agent-context: Sample conductor with proper CIA validation patterns
export class GoodConductor {
  private sequences: Map<string, any> = new Map();
  private handlers: Map<string, any> = new Map();

  // GOOD: Proper validation before mounting
  mount(sequence: any, handlers: any): boolean {
    try {
      // Validate sequence
      if (!sequence) {
        console.error('Mount failed: sequence is required');
        return false;
      }

      if (!sequence.movements || !Array.isArray(sequence.movements)) {
        console.error('Mount failed: sequence.movements must be an array');
        return false;
      }

      // Validate handlers
      if (!handlers || typeof handlers !== 'object') {
        console.error('Mount failed: handlers must be an object');
        return false;
      }

      // Validate movement-to-handler mapping
      for (const movement of sequence.movements) {
        if (!movement.label) {
          console.warn('Movement missing label, skipping');
          continue;
        }

        if (!(movement.label in handlers)) {
          console.warn(`Missing handler for movement: ${movement.label}`);
        }

        if (handlers[movement.label] && typeof handlers[movement.label] !== 'function') {
          console.error(`Handler for ${movement.label} is not a function`);
          return false;
        }
      }

      this.sequences.set(sequence.id, sequence);
      this.handlers.set(sequence.id, handlers);
      
      console.log('Successfully mounted plugin:', sequence.id);
      return true;

    } catch (error) {
      console.error('Mount failed with error:', error);
      return false;
    }
  }

  // GOOD: Correct parameter order
  registerSequence(sequence: any, handlers: any): boolean {
    return this.mount(sequence, handlers);
  }

  // GOOD: Proper handler validation before execution
  executeMovement(sequenceId: string, movementLabel: string, data: any): any {
    try {
      const handlers = this.handlers.get(sequenceId);
      
      if (!handlers) {
        console.warn(`No handlers found for sequence: ${sequenceId}`);
        return null;
      }

      if (!(movementLabel in handlers)) {
        console.warn(`Missing handler for movement: ${movementLabel}`);
        return null;
      }

      const handler = handlers[movementLabel];
      if (typeof handler !== 'function') {
        console.error(`Handler for ${movementLabel} is not a function`);
        return null;
      }

      return handler(data);

    } catch (error) {
      console.error(`Handler execution failed for ${movementLabel}:`, error);
      return null;
    }
  }

  // GOOD: Proper error handling and graceful failure
  async loadPlugin(pluginPath: string): Promise<boolean> {
    try {
      const plugin = await import(pluginPath);
      
      // Validate plugin structure after import
      if (!plugin || typeof plugin !== 'object') {
        console.warn(`Failed to load plugin: invalid plugin structure at ${pluginPath}`);
        return false;
      }

      if (!plugin.sequence || !plugin.handlers) {
        console.warn(`Plugin missing required exports (sequence, handlers): ${pluginPath}`);
        return false;
      }

      return this.mount(plugin.sequence, plugin.handlers);

    } catch (error) {
      console.warn(`Failed to load plugin from ${pluginPath}:`, error.message);
      return false; // Graceful failure - continue operation
    }
  }
}
