/**
 * CIA-Compliant Musical Conductor Test Suite
 * Tests for the migrated conductor with CIA compliance
 */

import { MusicalConductor } from './MusicalConductor';
import { EventBus } from '../EventBus';
import { SEQUENCE_CATEGORIES, MUSICAL_DYNAMICS, MUSICAL_TIMING } from './SequenceTypes';

describe('CIA-Compliant Musical Conductor', () => {
  let conductor: MusicalConductor;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    conductor = new MusicalConductor(eventBus);
  });

  describe('Legacy Functionality (Backward Compatibility)', () => {
    it('should register sequences using legacy registerSequence method', () => {
      const sequence = {
        name: 'test-sequence',
        description: 'Test sequence',
        key: 'C Major',
        tempo: 120,
        category: SEQUENCE_CATEGORIES.COMPONENT_UI,
        movements: []
      };

      conductor.registerSequence(sequence);
      expect(conductor.getSequence('test-sequence')).toBeDefined();
      expect(conductor.getSequenceNames()).toContain('test-sequence');
    });

    it('should unregister sequences using legacy unregisterSequence method', () => {
      const sequence = {
        name: 'test-sequence',
        description: 'Test sequence',
        key: 'C Major',
        tempo: 120,
        category: SEQUENCE_CATEGORIES.COMPONENT_UI,
        movements: []
      };

      conductor.registerSequence(sequence);
      conductor.unregisterSequence('test-sequence');
      expect(conductor.getSequence('test-sequence')).toBeUndefined();
    });
  });

  describe('CIA Mount Tests', () => {
    it('should reject malformed plugin', () => {
      const result = conductor.mount(null, {});
      expect(result.success).toBe(false);
      expect(result.message).toContain('sequence is required');
    });

    it('should validate sequence before mounting', () => {
      const invalidSequence = { name: 'test' }; // Missing movements
      const result = conductor.mount(invalidSequence, {});
      expect(result.success).toBe(false);
      expect(result.message).toContain('sequence.movements must be an array');
    });

    it('should validate handlers before mounting', () => {
      const validSequence = { 
        name: 'test', 
        movements: [],
        description: 'Test sequence',
        key: 'C Major',
        tempo: 120,
        category: SEQUENCE_CATEGORIES.COMPONENT_UI
      };
      const result = conductor.mount(validSequence, null);
      expect(result.success).toBe(false);
      expect(result.message).toContain('handlers must be an object');
    });

    it('should successfully mount valid plugin', () => {
      const validSequence = {
        name: 'test-sequence',
        description: 'Test sequence',
        key: 'C Major',
        tempo: 120,
        category: SEQUENCE_CATEGORIES.COMPONENT_UI,
        movements: [{
          name: 'TestMovement',
          beats: [{
            beat: 1,
            event: 'test-event',
            dynamics: MUSICAL_DYNAMICS.MEZZO_FORTE,
            timing: MUSICAL_TIMING.IMMEDIATE
          }]
        }]
      };
      const validHandlers = {
        TestMovement: () => console.log('Test handler')
      };

      const result = conductor.mount(validSequence, validHandlers);
      expect(result.success).toBe(true);
      expect(result.pluginId).toBe('test-sequence');
      expect(conductor.getMountedPluginIds()).toContain('test-sequence');
    });

    it('should warn about missing handlers for movements', () => {
      const sequenceWithMissingHandler = {
        name: 'test-sequence',
        description: 'Test sequence',
        key: 'C Major',
        tempo: 120,
        category: SEQUENCE_CATEGORIES.COMPONENT_UI,
        movements: [{
          name: 'MissingHandlerMovement',
          beats: []
        }]
      };
      const emptyHandlers = {};

      const result = conductor.mount(sequenceWithMissingHandler, emptyHandlers);
      expect(result.success).toBe(true);
      expect(result.warnings).toContain('Missing handler for movement: MissingHandlerMovement');
    });
  });

  describe('CIA Plugin Loader Tests', () => {
    it('should handle plugin load failures gracefully', async () => {
      const result = await conductor.loadPlugin('non-existent-plugin');
      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to load plugin');
    });

    it('should validate plugin structure after import', async () => {
      // This would require mocking the import in a real test environment
      const invalidPlugin = { invalidStructure: true };
      const result = conductor.mount(invalidPlugin, {});
      expect(result.success).toBe(false);
    });
  });

  describe('CIA Handler Validation Tests', () => {
    it('should validate handlers before invocation', () => {
      const result = conductor.executeMovementHandler('non-existent', 'test', {});
      expect(result).toBeNull();
    });

    it('should execute valid handlers successfully', () => {
      const mockHandler = jest.fn(() => 'handler result');
      const sequence = {
        name: 'test',
        description: 'Test',
        key: 'C Major',
        tempo: 120,
        category: SEQUENCE_CATEGORIES.COMPONENT_UI,
        movements: [{ name: 'TestMovement', beats: [] }]
      };
      const handlers = { TestMovement: mockHandler };
      
      conductor.mount(sequence, handlers);
      const result = conductor.executeMovementHandler('test', 'TestMovement', { data: 'test' });
      
      expect(mockHandler).toHaveBeenCalledWith({ data: 'test' });
      expect(result).toBe('handler result');
    });
  });

  describe('CIA Plugin Management', () => {
    it('should unmount plugins successfully', () => {
      const sequence = {
        name: 'test',
        description: 'Test',
        key: 'C Major',
        tempo: 120,
        category: SEQUENCE_CATEGORIES.COMPONENT_UI,
        movements: []
      };
      const handlers = {};
      
      conductor.mount(sequence, handlers);
      expect(conductor.getMountedPluginIds()).toContain('test');
      
      const unmountResult = conductor.unmountPlugin('test');
      expect(unmountResult).toBe(true);
      expect(conductor.getMountedPluginIds()).not.toContain('test');
    });

    it('should provide plugin information', () => {
      const sequence = {
        name: 'test',
        description: 'Test',
        key: 'C Major',
        tempo: 120,
        category: SEQUENCE_CATEGORIES.COMPONENT_UI,
        movements: []
      };
      const handlers = {};
      
      conductor.mount(sequence, handlers);
      const pluginInfo = conductor.getPluginInfo('test');
      
      expect(pluginInfo).toBeDefined();
      expect(pluginInfo?.sequence.name).toBe('test');
      expect(pluginInfo?.handlers).toBe(handlers);
    });

    it('should include plugin count in statistics', () => {
      const sequence = {
        name: 'test',
        description: 'Test',
        key: 'C Major',
        tempo: 120,
        category: SEQUENCE_CATEGORIES.COMPONENT_UI,
        movements: []
      };
      const handlers = {};
      
      conductor.mount(sequence, handlers);
      const stats = conductor.getStatistics();
      
      expect(stats.mountedPlugins).toBe(1);
    });
  });

  describe('Integration Tests', () => {
    it('should maintain both legacy and CIA functionality', () => {
      // Legacy sequence registration
      const legacySequence = {
        name: 'legacy-sequence',
        description: 'Legacy sequence',
        key: 'C Major',
        tempo: 120,
        category: SEQUENCE_CATEGORIES.COMPONENT_UI,
        movements: []
      };
      conductor.registerSequence(legacySequence);

      // CIA plugin mounting
      const ciaSequence = {
        name: 'cia-sequence',
        description: 'CIA sequence',
        key: 'D Major',
        tempo: 140,
        category: SEQUENCE_CATEGORIES.COMPONENT_UI,
        movements: []
      };
      const ciaHandlers = {};
      const mountResult = conductor.mount(ciaSequence, ciaHandlers);

      // Both should be available
      expect(conductor.getSequenceNames()).toContain('legacy-sequence');
      expect(conductor.getSequenceNames()).toContain('cia-sequence');
      expect(conductor.getMountedPluginIds()).toContain('cia-sequence');
      expect(conductor.getMountedPluginIds()).not.toContain('legacy-sequence');
      expect(mountResult.success).toBe(true);
    });
  });
});
