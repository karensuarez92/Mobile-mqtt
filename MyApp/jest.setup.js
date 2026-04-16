/* eslint-env jest, node */
/**
 * Jest global setup for unit tests.
 *
 * Mocks the `mqtt` module so tests don't attempt real network connections.
 * The mock exposes `__emit(event, ...args)` on the client so tests can
 * trigger MQTT events synchronously.
 */

jest.mock('mqtt', () => {
  const listeners = {};
  const client = {
    on: jest.fn((event, handler) => {
      listeners[event] = handler;
      return client;
    }),
    subscribe: jest.fn((_topic, cb) => {
      if (cb) {
        cb(null);
      }
    }),
    publish: jest.fn(),
    end: jest.fn(),
    __listeners: listeners,
    __emit: (event, ...args) => {
      if (listeners[event]) {
        listeners[event](...args);
      }
    },
  };
  return {
    __esModule: true,
    default: {
      connect: jest.fn(() => client),
      __client: client,
    },
    connect: jest.fn(() => client),
  };
});
