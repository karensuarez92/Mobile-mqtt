import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Navigation from './src/navigation/navigation';

import { commonStyles } from './src/utils/styles/commonStyles';

function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={commonStyles.screenContainer}>
        <Navigation />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default App;
