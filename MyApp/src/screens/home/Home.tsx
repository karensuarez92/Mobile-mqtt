import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { Header } from '../Header/Header';
import mqtt from 'mqtt';
import { Colors } from '../../utils/helpers/colors';
import Ionicons from '@react-native-vector-icons/ionicons';
import { LineChart } from 'react-native-gifted-charts';
import LinearGradient from 'react-native-linear-gradient';

const screenWidth = Dimensions.get('window').width;

export const Home = () => {
  const [msg, setMsg] = useState({
    temp: '',
    hum: '',
  });

  const findText = (text: string) => {
    const regex = /Temp:\s*([\d.]+).*Hum:\s*([\d.]+)/;
    const match = text.match(regex);
    if (match) {
      const temperatura = parseFloat(match[1]);
      const humedad = parseFloat(match[2]);
      return { temperatura, humedad };
    } else {
      return { temperatura: '0', humedad: '0' };
    }
  };

  useEffect(() => {
    const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

    client.on('connect', () => {
      console.log('Conectado a HiveMQ por WS');
      client.subscribe('esp32/temperatura', error => {
        console.log(error);
        if (!error) {
          client.publish('esp32/temperatura', 'Conectando...');
        }
      });
    });

    client.on('message', (topic, message) => {
      const parsedText = message.toString() ?? '0';
      setMsg({
        temp: findText(parsedText)?.temperatura.toString(),
        hum: findText(parsedText)?.humedad.toString(),
      });
    });
    return () => {
      client.end();
    };
  }, []);

  const data = [
    {
      value: 0,
      label: ' 8 am',
    },
    {
      value: 0,
      label: '10 am ',
    },
    {
      value: 0,
      label: ' 12 pm',
    },
    {
      value: 22.9,
      label: ' 2 pm',
    },
    {
      value: 20,
      label: '4 pm ',
    },
    {
      value: 23.2,
      label: ' 6 pm',
    },
    {
      value: 18.5,
      label: '8 pm ',
    },
    {
      value: 14,
      label: '10 pm ',
    },
  ];

  // const barData = [{ value: 15 }, { value: 30 }, { value: 26 }, { value: 40 }];

  return (
    <LinearGradient
      colors={['#e2e5eaff', '#5d8dcbff', '#234dc0ff']} // Colores del gradiente
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View>
        <Text style={styles.text}>
          Instituto Tecnologico Superior De Huichapan
        </Text>
      </View>
      <View style={{ width: '90%' }}>
        <Image //resizeMode="contain"
          source={require('../../assets/image/iteshu.png')}
          style={{ width: '110%', height: 100 }}
        ></Image>
      </View>
      <View style={styles.card3}>
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
        <Text style={styles.tempValue}>{msg && `${msg.temp} °C`}</Text>
      </View>

      <View style={styles.sensorContainer}>
        <Text style={styles.temp}>Humedad</Text>
      </View>
      <View style={styles.card2}>
        <Ionicons
          name="water-outline"
          color={'white'}
          size={60}
          style={{ paddingTop: 10 }}
        />
        <Text style={styles.tempValue}>{msg.hum} %</Text>
      </View>
      {/* Histograma con colores dinámicos */}
      <View style={styles.histContainer}>
        <Text style={styles.histTitle}>Historial</Text>
        <LineChart
          data={data}
          width={screenWidth}
          height={200}
          color1="#1acf35ff"
          hideDataPoints={false}
        />
      </View>
    </LinearGradient>
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
  card3: {
    flexDirection: 'row',
    //justifyContent: 'center',
    //  alignItems: 'center',
    //  marginTop: 20,
  },
});
