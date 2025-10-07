import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../utils/helpers/colors';

export const Header = () => {
  return (
    <View style={styles.content}>
      <Text>Hola soy el header</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.morado,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
});
