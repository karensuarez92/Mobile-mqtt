import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import mqtt from 'mqtt';
import { Colors } from '../../utils/helpers/colors';
import { mqttConfig, sanitizeMqttPayload } from '../../utils/config/mqttConfig';

export const Home = () => {
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const client = mqtt.connect(mqttConfig.brokerUrl, {
      username: mqttConfig.username,
      password: mqttConfig.password,
      // `mqtt.js` uses the native WebSocket/TLS implementation of the platform
      // when connecting over `wss://`. Rejecting unauthorised certificates is
      // the default; we set it explicitly so a future downgrade is obvious.
      rejectUnauthorized: true,
    });
    client.on('connect', () => {
      client.subscribe(mqttConfig.topic, error => {
        if (!error) {
          client.publish(mqttConfig.topic, 'Conectando...');
        }
      });
    });

    client.on('message', (_topic, message) => {
      const safe = sanitizeMqttPayload(message);
      if (safe !== null) {
        setMsg(safe);
      }
    });

    return () => {
      client.end();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.text}>{msg}</Text>
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
});
