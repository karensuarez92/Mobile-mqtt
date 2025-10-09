import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Header } from '../Header/Header';
import mqtt from 'mqtt';
import { Colors } from '../../utils/helpers/colors';
import Ionicons from '@react-native-vector-icons/ionicons';

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
      <View>
        <Text style={styles.text}>
          Instituto Tecnologico Superior De Huichapan
        </Text>
      </View>
      <View style={styles.card2}>
        <Ionicons name="location-outline" color={'white'} size={20} />
        <Text style={styles.tex2}>El Saucillo</Text>
      </View>
      <View>
        <View style={styles.sensorContainer}></View>
        <Text style={styles.temp}>Temperatura</Text>
        <Text style={styles.tempValue}>{msg ? `${msg} °C` : '--- °C'}</Text>
        <View style={styles.iconRow}></View>
      </View>
      <Ionicons
        name="thermometer-outline"
        color={'white'}
        size={60}
        style={{ paddingTop: 10 }}
      />
      <Text style={styles.humed}>Humedad</Text>
      <Text style={styles.tempValue}>{msg ? `${msg} °C` : '--- °C'}</Text>
      <Ionicons
        name="water-outline"
        color={'white'}
        size={60}
        style={styles.icono}
      />
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
    fontSize: 19,
    color: Colors.white,
    fontWeight: '800',
    padding: 20,
  },
  tex2: {
    fontSize: 25,
    color: Colors.white,
    fontWeight: '600',
  },
  card2: {
    flexDirection: 'row',
    justifyContent: 'center',
    //backgroundColor: 'red',
    alignItems: 'center',
    marginTop: 20,
  },
  temp: {
    fontSize: 22,
    color: Colors.white,
    fontWeight: '800',
    backgroundColor: 'red',
    //marginTop: 30,
    //padding: 8,
  },
  humed: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: '500',
    backgroundColor: 'red',
    marginTop: 10,
    padding: 10,
  },
  icono: {
    //backgroundColor: 'blue',
    paddingTop: 30,
  },

  sensorContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tempValue: {
    fontSize: 30,
    color: Colors.white,
    fontWeight: '700',
  },
});
