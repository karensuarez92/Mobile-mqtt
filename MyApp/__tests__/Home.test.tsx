/**
 * Unit tests for the Home screen.
 *
 * The `mqtt` module is mocked globally in `jest.setup.js`. The mock exposes
 * a `__client` handle with an `__emit` helper so these tests can drive the
 * connect/message/error events synchronously.
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import mqtt from 'mqtt';

import { Home } from '../src/screens/home/Home';

type MqttMock = {
  connect: jest.Mock;
  __client: {
    on: jest.Mock;
    subscribe: jest.Mock;
    publish: jest.Mock;
    end: jest.Mock;
    __emit: (event: string, ...args: unknown[]) => void;
  };
};

const mqttMock = mqtt as unknown as MqttMock;

describe('Home screen', () => {
  beforeEach(() => {
    mqttMock.connect.mockClear();
    mqttMock.__client.on.mockClear();
    mqttMock.__client.subscribe.mockClear();
    mqttMock.__client.publish.mockClear();
    mqttMock.__client.end.mockClear();
  });

  it('connects to the HiveMQ broker on mount', () => {
    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<Home />);
    });
    expect(mqttMock.connect).toHaveBeenCalledTimes(1);
    expect(mqttMock.connect).toHaveBeenCalledWith(
      'wss://broker.hivemq.com:8884/mqtt',
    );
  });

  it('registers listeners for connect and message events', () => {
    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<Home />);
    });
    const events = mqttMock.__client.on.mock.calls.map(c => c[0]);
    expect(events).toEqual(expect.arrayContaining(['connect', 'message']));
  });

  it('subscribes to the temperature topic and publishes a handshake on connect', () => {
    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<Home />);
    });

    ReactTestRenderer.act(() => {
      mqttMock.__client.__emit('connect');
    });

    expect(mqttMock.__client.subscribe).toHaveBeenCalledWith(
      'esp32/temperatura',
      expect.any(Function),
    );
    expect(mqttMock.__client.publish).toHaveBeenCalledWith(
      'esp32/temperatura',
      'Conectando...',
    );
  });

  it('does not publish a handshake when subscribe reports an error', () => {
    // Override the subscribe behavior for this one test only.
    mqttMock.__client.subscribe.mockImplementationOnce((_topic, cb) => {
      if (cb) {
        cb(new Error('subscribe failed'));
      }
    });

    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<Home />);
    });

    ReactTestRenderer.act(() => {
      mqttMock.__client.__emit('connect');
    });

    expect(mqttMock.__client.subscribe).toHaveBeenCalled();
    expect(mqttMock.__client.publish).not.toHaveBeenCalled();
  });

  it('renders incoming MQTT messages in the card', () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<Home />);
    });

    ReactTestRenderer.act(() => {
      mqttMock.__client.__emit('message', 'esp32/temperatura', Buffer.from('25.3'));
    });

    const texts = tree.root.findAllByType(Text);
    const rendered = texts.map(t => t.props.children).join(' ');
    expect(rendered).toContain('25.3');
  });

  it('closes the MQTT client when unmounted', () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<Home />);
    });

    ReactTestRenderer.act(() => {
      tree.unmount();
    });

    expect(mqttMock.__client.end).toHaveBeenCalledTimes(1);
  });
});
