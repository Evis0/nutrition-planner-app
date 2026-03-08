import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import SettingsScreen from './src/screens/SettingsScreen';
import HomeScreen from './src/screens/HomeScreen';
import JournalScreen from './src/screens/JournalScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import ScanScreen from './src/screens/ScanScreen';

import { HomeIcon } from './assets/tabIcons';
import { ScanIcon } from './assets/tabIcons';
import { JournalIcon } from './assets/tabIcons';
import { ProgressIcon } from './assets/tabIcons';
import { SettingsIcon } from './assets/tabIcons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Tab.Navigator screenOptions={{tabBarActiveTintColor: "#000", tabBarInactiveTintColor: "#888"}}>
                <Tab.Screen name="Home" component={HomeScreen} options={{tabBarIcon: ({color}) => <HomeIcon color={color}/> }}/>
                <Tab.Screen name="Scan" component={ScanScreen} options={{tabBarIcon: ({color}) => <ScanIcon color={color}/> }}/>
                <Tab.Screen name="Journal" component={JournalScreen} options={{tabBarIcon: ({color}) => <JournalIcon color={color}/> }}/>
                <Tab.Screen name="Progress" component={ProgressScreen} options={{tabBarIcon: ({color}) => <ProgressIcon color={color}/> }}/>
                <Tab.Screen name="Settings" component={SettingsScreen} options={{tabBarIcon: ({color}) => <SettingsIcon color={color}/> }}/>
            </Tab.Navigator>
        </NavigationContainer>
    )
}

// export default function App(){
//     return (
//         <NavigationContainer>
//             <BottomTabs />
//             <Stack.Navigator> 
//               <Stack.Screen name="Home" component={HomeScreen} />
//               <Stack.Screen name="Scan" component={ScanScreen} />
//               <Stack.Screen name="Progress" component={ProgressScreen} />
//               <Stack.Screen name="Journal" component={JournalScreen} />
//               <Stack.Screen name="Settings" component={SettingScreen} />
//             </Stack.Navigator>
//         </NavigationContainer>  
//     )
// }