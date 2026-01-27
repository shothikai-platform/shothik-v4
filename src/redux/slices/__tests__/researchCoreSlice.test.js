import { describe, it, expect } from 'vitest';
import reducer, { addStreamEvents, startStreaming } from '../researchCoreSlice';

describe('researchCoreSlice', () => {
  const initialState = {
    streamEvents: [],
    eventSequenceNumber: 0,
    isStreaming: true,
  };

  it('should handle addStreamEvents with multiple events', () => {
    const state = reducer(undefined, startStreaming({ jobId: 'test-job' }));

    const events = [
      { step: 'step1', message: 'msg1', timestamp: 1000 },
      { step: 'step2', message: 'msg2', timestamp: 1001 },
    ];

    const nextState = reducer(state, addStreamEvents(events));

    expect(nextState.streamEvents).toHaveLength(2);
    expect(nextState.streamEvents[0]).toMatchObject(events[0]);
    expect(nextState.streamEvents[1]).toMatchObject(events[1]);
    expect(nextState.streamEvents[0].sequenceNumber).toBe(0);
    expect(nextState.streamEvents[1].sequenceNumber).toBe(1);
  });

  it('should handle deduplication in addStreamEvents', () => {
    const state = reducer(undefined, startStreaming({ jobId: 'test-job' }));

    const events = [
      { step: 'step1', message: 'msg1', timestamp: 1000 }, // Original
      { step: 'step1', message: 'msg1', timestamp: 1000 }, // Duplicate
      { step: 'step2', message: 'msg2', timestamp: 1002 }, // New
    ];

    const nextState = reducer(state, addStreamEvents(events));

    expect(nextState.streamEvents).toHaveLength(2);
    expect(nextState.streamEvents[0].step).toBe('step1');
    expect(nextState.streamEvents[1].step).toBe('step2');
  });

  it('should respect the size limit of 100 events when batch adding', () => {
    const state = reducer(undefined, startStreaming({ jobId: 'test-job' }));

    // Create 110 events
    const events = Array.from({ length: 110 }, (_, i) => ({
      step: `step${i}`,
      message: `msg${i}`,
      timestamp: Date.now() + i,
    }));

    const nextState = reducer(state, addStreamEvents(events));

    expect(nextState.streamEvents).toHaveLength(100);
    // Should contain the last 100 events (10 to 109)
    expect(nextState.streamEvents[0].step).toBe('step10');
    expect(nextState.streamEvents[99].step).toBe('step109');
  });
});
