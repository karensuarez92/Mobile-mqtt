import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Header } from '../Header/Header';
import mqtt from 'mqtt';
import { Colors } from '../../utils/helpers/colors';

export const Home = () => {
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');
    client.on('connect', () => {
      console.log('Conectado a HiveMQ por WS');
      client.subscribe('esp32/temperatura', error => {
        if (!error) {
          client.publish('esp32/temperatura', 'Conectando...');
        }
      });
    });

    client.on('message', (topic, message) => {
      setMsg(message.toString());
      console.log(`📩 ${topic}: ${message.toString()}`);
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
