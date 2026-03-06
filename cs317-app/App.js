import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SettingScreen from './src/screens/SettingScreen';
import HomeScreen from './src/screens/HomeScreen';
import JournalScreen from './src/screens/JournalScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import ScanScreen from './src/screens/ScanScreen';

const Stack = createNativeStackNavigator();

export default function App(){
    return (
        <NavigationContainer>
            <Stack.Navigator> 
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Scan" component={ScanScreen} />
              <Stack.Screen name="Progress" component={ProgressScreen} />
              <Stack.Screen name="Journal" component={JournalScreen} />
              <Stack.Screen name="Settings" component={SettingScreen} />
            </Stack.Navigator>
        </NavigationContainer>  
    )
}