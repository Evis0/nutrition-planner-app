import React from 'react';
import { Button, Pressable } from 'react-native'
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
            <Stack.Navigator>
                <Stack.Screen name="Main" component={BottomTabs} options={{ headerShown: false }}/>
                <Stack.Screen name="Settings" component={SettingsScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

function BottomTabs() {
    return (
        <Tab.Navigator screenOptions={{ tabBarActiveTintColor: "black", tabBarInactiveTintColor: "grey" }}>
            <Tab.Screen name="Home" component={HomeScreen} options={({ navigation }) => ({
                tabBarIcon: ({ color }) => <HomeIcon color={color} />,
                headerRight: () => <Pressable onPress={() => navigation.navigate("Settings")} style={{ paddingRight: 20 }}><SettingsIcon color="black" size={24} /></Pressable>
            })} />
            <Tab.Screen name="Scan" component={ScanScreen} options={({ navigation }) => ({
                tabBarIcon: ({ color }) => <ScanIcon color={color} />,
                headerRight: () => <Pressable onPress={() => navigation.navigate("Settings")} style={{ paddingRight: 20 }}><SettingsIcon color="black" size={24} /></Pressable>
            })} />
            <Tab.Screen name="Journal" component={JournalScreen} options={({ navigation }) => ({
                tabBarIcon: ({ color }) => <JournalIcon color={color} />,
                headerRight: () => <Pressable onPress={() => navigation.navigate("Settings")} style={{ paddingRight: 20 }}><SettingsIcon color="black" size={24} /></Pressable>
            })} />
            <Tab.Screen name="Progress" component={ProgressScreen} options={({ navigation }) => ({
                tabBarIcon: ({ color }) => <ProgressIcon color={color} />,
                headerRight: () => <Pressable onPress={() => navigation.navigate("Settings")} style={{ paddingRight: 20 }}><SettingsIcon color="black" size={24} /></Pressable>
            })} />
        </Tab.Navigator>
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