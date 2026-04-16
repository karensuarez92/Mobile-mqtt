import { StyleSheet } from 'react-native';
import { Colors } from '../helpers/colors';

/**
 * Shared style primitives used across multiple screens/components so we don't
 * redeclare the same `flex: 1` + `backgroundColor` blocks in every file.
 */
export const commonStyles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.mainBg,
  },
  card: {
    borderRadius: 10,
    width: '100%',
    padding: 8,
    backgroundColor: Colors.cardBg,
  },
});
