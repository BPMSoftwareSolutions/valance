// @agent-context: test for sequence definition validation
import { sequence } from '../sequence';

describe('Canvas Component Drag Symphony Sequence', () => {
  it('should have valid sequence structure', () => {
    expect(sequence).toBeDefined();
    expect(sequence.id).toBe('canvas-component-drag-symphony');
    expect(sequence.version).toBe('1.0.0');
    expect(sequence.key).toBe('D Major');
    expect(sequence.tempo).toBe(140);
  });

  it('should have correct number of movements', () => {
    expect(sequence.movements).toHaveLength(4);
  });

  it('should have properly structured movements', () => {
    const expectedMovements = [
      { label: 'DragStart', startBeat: 0, durationInBeats: 1, mood: 'anticipation' },
      { label: 'ElementMoved', startBeat: 1, durationInBeats: 1, mood: 'focus' },
      { label: 'DropValidation', startBeat: 2, durationInBeats: 1, mood: 'focus' },
      { label: 'Drop', startBeat: 3, durationInBeats: 1, mood: 'celebration' }
    ];

    expectedMovements.forEach((expected, index) => {
      const movement = sequence.movements[index];
      expect(movement.label).toBe(expected.label);
      expect(movement.startBeat).toBe(expected.startBeat);
      expect(movement.durationInBeats).toBe(expected.durationInBeats);
      expect(movement.mood).toBe(expected.mood);
    });
  });

  it('should have no overlapping beats', () => {
    for (let i = 0; i < sequence.movements.length - 1; i++) {
      const current = sequence.movements[i];
      const next = sequence.movements[i + 1];
      
      const currentEnd = current.startBeat + current.durationInBeats;
      expect(currentEnd).toBeLessThanOrEqual(next.startBeat);
    }
  });

  it('should have valid metadata', () => {
    expect(sequence.metadata).toBeDefined();
    expect(sequence.metadata.name).toBe('Canvas Component Drag Symphony No. 4');
    expect(sequence.metadata.category).toBe('canvas-operations');
  });
});
