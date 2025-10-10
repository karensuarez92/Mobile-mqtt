import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Header } from '../Header/Header';
import mqtt from 'mqtt';
import { Colors } from '../../utils/helpers/colors';
import Ionicons from '@react-native-vector-icons/ionicons';

export const Home = () => {
  const [msg, setMsg] = useState('');
  const [data, setData] = useState<number[]>([]); // ✅ especificamos el tipo

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
      const valor = parseFloat(message.toString());
      if (!isNaN(valor)) {
        setMsg(valor.toFixed(1));

        // 🟢 guardar los últimos 10 valores
        setData(prev => {
          const nuevos = [...prev, valor];
          if (nuevos.length > 5) nuevos.shift();
          return nuevos;
        });
      }
      //setMsg(message.toString());
      //setMsg(valor.toFixed(1));

      console.log(`📩 ${topic}: ${message.toString()}`);
    });
    return () => {
      client.end();
    };
  }, []);

  const barData = [{ value: 15 }, { value: 30 }, { value: 26 }, { value: 40 }];

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

      <View style={styles.sensorContainer}>
        <Text style={styles.temp}>Temperatura</Text>
      </View>

      <View style={styles.card2}>
        <Ionicons
          name="thermometer-outline"
          color={'white'}
          size={60}
          style={{ paddingTop: 10 }}
        />
        <Text style={styles.tempValue}>{msg ? `${msg} °C` : '--- °C'}</Text>
      </View>

      {/* Histograma con colores dinámicos */}
      <View style={styles.histContainer}>
        <Text style={styles.histTitle}>Historial de Temperatura</Text>
      </View>

      <View>
        <Text style={styles.humed}>Humedad</Text>
      </View>

      <View style={styles.card2}>
        <Ionicons
          name="water-outline"
          color={'white'}
          size={60}
          style={{ paddingTop: 10 }}
        />
        <Text style={styles.tempValue}>{msg ? `${msg} °C` : '--- °C'}</Text>
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
  card2: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
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
  temp: {
    fontSize: 22,
    color: Colors.white,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 20,
  },
  humed: {
    fontSize: 22,
    color: Colors.white,
    fontWeight: '500',
    marginTop: 10,
    padding: 10,
  },
  sensorContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  tempValue: {
    fontSize: 50,
    color: Colors.white,
    fontWeight: '700',
  },
  histContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 10,
  },
  histTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 5,
  },
});
