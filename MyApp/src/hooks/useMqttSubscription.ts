import { useEffect, useState } from 'react';
import mqtt from 'mqtt';

import { MQTT_BROKER_URL } from '../utils/mqtt/config';

export interface UseMqttSubscriptionOptions {
  /** Broker URL. Defaults to the shared HiveMQ broker. */
  brokerUrl?: string;
  /** Optional payload to publish once the subscription succeeds. */
  helloMessage?: string;
}

/**
 * Connects to an MQTT broker, subscribes to `topic`, and exposes the latest
 * message payload received on that topic. Handles connect/subscribe/disconnect
 * lifecycle so screens don't have to repeat the boilerplate in every effect.
 */
export function useMqttSubscription(
  topic: string,
  options: UseMqttSubscriptionOptions = {},
): string {
  const { brokerUrl = MQTT_BROKER_URL, helloMessage } = options;
  const [message, setMessage] = useState('');

  useEffect(() => {
    const client = mqtt.connect(brokerUrl);

    client.on('connect', () => {
      console.log(`Conectado a ${brokerUrl}`);
      client.subscribe(topic, error => {
        if (!error && helloMessage !== undefined) {
          client.publish(topic, helloMessage);
        }
      });
    });

    client.on('message', (receivedTopic, payload) => {
      const text = payload.toString();
      setMessage(text);
      console.log(`📩 ${receivedTopic}: ${text}`);
    });

    return () => {
      client.end();
    };
  }, [brokerUrl, topic, helloMessage]);

  return message;
}
