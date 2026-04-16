import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Colors } from '../../utils/helpers/colors';
import { commonStyles } from '../../utils/styles/commonStyles';
import { MQTT_TOPICS } from '../../utils/mqtt/config';
import { useMqttSubscription } from '../../hooks/useMqttSubscription';

export const Home = () => {
  const msg = useMqttSubscription(MQTT_TOPICS.temperature, {
    helloMessage: 'Conectando...',
  });

  return (
    <View style={styles.container}>
      <View style={commonStyles.card}>
        <Text style={styles.text}>{msg}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.screenContainer,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  text: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: '800',
  },
});
