import './global.css';

import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
    </View>
  );
}
