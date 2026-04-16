import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import mqtt from 'mqtt';
import { Colors } from '../../utils/helpers/colors';

const MQTT_URL = 'wss://broker.hivemq.com:8884/mqtt';
const MQTT_TOPIC = 'esp32/temperatura';

type ConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'offline'
  | 'error'
  | 'closed';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return 'Unknown error';
  }
};

export const Home = () => {
  const [msg, setMsg] = useState('');
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let client: mqtt.MqttClient | null = null;

    try {
      client = mqtt.connect(MQTT_URL);
    } catch (err) {
      const message = getErrorMessage(err);
      console.error('[MQTT] Failed to initialize client:', message);
      setStatus('error');
      setErrorMsg(message);
      return;
    }

    client.on('connect', () => {
      console.log('[MQTT] Connected to broker');
      setStatus('connected');
      setErrorMsg(null);

      client?.subscribe(MQTT_TOPIC, subscribeError => {
        if (subscribeError) {
          const message = getErrorMessage(subscribeError);
          console.error(
            `[MQTT] Failed to subscribe to ${MQTT_TOPIC}:`,
            message,
          );
          setErrorMsg(`Subscribe failed: ${message}`);
          return;
        }

        client?.publish(MQTT_TOPIC, 'Conectando...', publishError => {
          if (publishError) {
            const publishMessage = getErrorMessage(publishError);
            console.error(
              `[MQTT] Failed to publish to ${MQTT_TOPIC}:`,
              publishMessage,
            );
            setErrorMsg(`Publish failed: ${publishMessage}`);
          }
        });
      });
    });

    client.on('message', (topic, message) => {
      try {
        const text = message.toString();
        setMsg(text);
        console.log(`[MQTT] ${topic}: ${text}`);
      } catch (err) {
        const errMessage = getErrorMessage(err);
        console.error(
          `[MQTT] Failed to decode message on ${topic}:`,
          errMessage,
        );
        setErrorMsg(`Invalid payload on ${topic}: ${errMessage}`);
      }
    });

    client.on('error', err => {
      const message = getErrorMessage(err);
      console.error('[MQTT] Client error:', message);
      setStatus('error');
      setErrorMsg(message);
    });

    client.on('reconnect', () => {
      console.log('[MQTT] Reconnecting...');
      setStatus('reconnecting');
    });

    client.on('offline', () => {
      console.warn('[MQTT] Client is offline');
      setStatus('offline');
    });

    client.on('close', () => {
      console.log('[MQTT] Connection closed');
      setStatus('closed');
    });

    return () => {
      try {
        client?.end(true);
      } catch (err) {
        console.error(
          '[MQTT] Error while closing client:',
          getErrorMessage(err),
        );
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.status}>Status: {status}</Text>
        <Text style={styles.text}>{msg}</Text>
        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.mainBg,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  card: {
    borderRadius: 10,
    width: '100%',
    padding: 8,
    backgroundColor: Colors.cardBg,
  },
  text: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: '800',
  },
  status: {
    fontSize: 14,
    color: Colors.white,
    marginBottom: 4,
  },
  error: {
    fontSize: 14,
    color: '#ff6b6b',
    marginTop: 8,
  },
});
