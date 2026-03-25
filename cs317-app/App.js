import React from 'react';
import { Pressable, useColorScheme } from 'react-native'
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemePreferenceContext } from './src/context/ThemePreferenceContext';
import { ScannedFoodContext } from './src/context/ScannedFoodContext';
import { PlanProvider } from './src/context/PlanContext';

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
const SCANNED_FOODS_STORAGE_KEY = 'scannedFoods';
const JOURNAL_SCANNED_FOODS_STORAGE_KEY = 'journalScannedFoods';

export default function App() {
    const systemColorScheme = useColorScheme();
    const [themePreference, setThemePreference] = React.useState('system');

    const effectiveTheme =
        themePreference === 'system'
            ? (systemColorScheme === 'dark' ? 'dark' : 'light')
            : themePreference;

    const navigationTheme = React.useMemo(() => {
        const baseTheme = effectiveTheme === 'dark' ? DarkTheme : DefaultTheme;

        return {
            ...baseTheme,
            colors: {
                ...baseTheme.colors,
                primary: effectiveTheme === 'dark' ? '#22C55E' : '#2563EB',
                background: effectiveTheme === 'dark' ? '#111315' : '#F8F9FB',
                card: effectiveTheme === 'dark' ? '#1B1D21' : '#FFFFFF',
                text: effectiveTheme === 'dark' ? '#F5F7FA' : '#161718',
                border: effectiveTheme === 'dark' ? '#2C3036' : '#E5E7EB',
            },
        };
    }, [effectiveTheme]);

    const contextValue = React.useMemo(() => ({
        themePreference,
        effectiveTheme,
        setThemePreference,
    }), [themePreference, effectiveTheme]);

    const [scannedFoods, updateScannedFoods] = React.useState([]);
    const [journalScannedFoods, updateJournalScannedFoods] = React.useState([]);
    const [isScannedFoodsHydrated, setIsScannedFoodsHydrated] = React.useState(false);

    React.useEffect(() => {
        const loadScannedFoods = async () => {
            try {
                const [savedFoods, savedJournalFoods] = await Promise.all([
                    AsyncStorage.getItem(SCANNED_FOODS_STORAGE_KEY),
                    AsyncStorage.getItem(JOURNAL_SCANNED_FOODS_STORAGE_KEY),
                ]);

                if (savedFoods) {
                    updateScannedFoods(JSON.parse(savedFoods));
                }

                if (savedJournalFoods) {
                    updateJournalScannedFoods(JSON.parse(savedJournalFoods));
                }
            } catch (error) {
                console.log('Error loading scanned foods:', error);
            } finally {
                setIsScannedFoodsHydrated(true);
            }
        };

        loadScannedFoods();
    }, []);

    React.useEffect(() => {
        if (!isScannedFoodsHydrated) {
            return;
        }

        const persistScannedFoods = async () => {
            try {
                await Promise.all([
                    AsyncStorage.setItem(
                        SCANNED_FOODS_STORAGE_KEY,
                        JSON.stringify(scannedFoods)
                    ),
                    AsyncStorage.setItem(
                        JOURNAL_SCANNED_FOODS_STORAGE_KEY,
                        JSON.stringify(journalScannedFoods)
                    ),
                ]);
            } catch (error) {
                console.log('Error saving scanned foods:', error);
            }
        };

        persistScannedFoods();
    }, [scannedFoods, journalScannedFoods, isScannedFoodsHydrated]);

    const addScannedFood = (product) => {
        updateScannedFoods(prev => [...prev, {
            id: Date.now(),
            barcode: product.code,
            name: product.product_name,
            mealType: 'Snack',
            carbs: product.nutriments.carbohydrates_100g + 'g',
            sugars: product.nutriments.sugars_100g + 'g'
        }]);
    }

    const addJournalScannedFood = (product) => {
        updateJournalScannedFoods(prev => [...prev, {
            id: Date.now(),
            barcode: product.code,
            name: product.product_name,
            mealType: 'Snack',
            carbs: product.nutriments.carbohydrates_100g + 'g',
            sugars: product.nutriments.sugars_100g + 'g'
        }]);
    }

    const deleteScannedFoods = () => {
        updateScannedFoods([]);
    }

    const deleteJournalScannedFoods = () => {
        updateJournalScannedFoods([]);
    }

    const scannedFoodsValue = React.useMemo(() => ({
        scannedFoods,
        setScannedFoods: updateScannedFoods,
        journalScannedFoods,
        setJournalScannedFoods: updateJournalScannedFoods,
        addScannedFood,
        addRecentScannedFood: addScannedFood,
        addJournalScannedFood,
        deleteScannedFoods,
        deleteJournalScannedFoods,
    }), [scannedFoods, journalScannedFoods]);

    return (
        <ThemePreferenceContext.Provider value={contextValue}>
            <ScannedFoodContext.Provider value = {scannedFoodsValue}>
                <PlanProvider>
                <NavigationContainer theme={navigationTheme}>
                    <Stack.Navigator
                        screenOptions={{
                            headerStyle: { backgroundColor: navigationTheme.colors.card },
                            headerTintColor: navigationTheme.colors.text,
                            headerShadowVisible: false,
                            contentStyle: { backgroundColor: navigationTheme.colors.background },
                        }}
                    >
                        <Stack.Screen name="Main" component={BottomTabs} options={{ headerShown: false }}/>
                        <Stack.Screen name="Settings" component={SettingsScreen} />
                    </Stack.Navigator>
                </NavigationContainer>
                </PlanProvider>
            </ScannedFoodContext.Provider>
        </ThemePreferenceContext.Provider>
    )
}

function BottomTabs() {
    const { effectiveTheme } = React.useContext(ThemePreferenceContext);
    const isDark = effectiveTheme === 'dark';

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: isDark ? '#FFFFFF' : '#161718',
                tabBarInactiveTintColor: isDark ? '#8A919B' : '#9CA3AF',
                tabBarStyle: {
                    backgroundColor: isDark ? '#1B1D21' : '#FFFFFF',
                    borderTopColor: isDark ? '#2C3036' : '#E5E7EB',
                },
                headerStyle: {
                    backgroundColor: isDark ? '#1B1D21' : '#FFFFFF',
                },
                headerTitleStyle: {
                    color: isDark ? '#F5F7FA' : '#161718',
                },
                sceneStyle: {
                    backgroundColor: isDark ? '#111315' : '#F8F9FB',
                },
            }}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={({ navigation }) => ({
                tabBarIcon: ({ color }) => <HomeIcon color={color} />,
                headerRight: () => <Pressable onPress={() => navigation.navigate("Settings")} style={{ paddingRight: 20 }}><SettingsIcon color={isDark ? '#F5F7FA' : '#161718'} size={24} /></Pressable>
            })} />
            <Tab.Screen name="Scan" component={ScanScreen} options={({ navigation }) => ({
                tabBarIcon: ({ color }) => <ScanIcon color={color} />,
                headerRight: () => <Pressable onPress={() => navigation.navigate("Settings")} style={{ paddingRight: 20 }}><SettingsIcon color={isDark ? '#F5F7FA' : '#161718'} size={24} /></Pressable>
            })} />
            <Tab.Screen name="Journal" component={JournalScreen} options={({ navigation }) => ({
                tabBarIcon: ({ color }) => <JournalIcon color={color} />,
                headerRight: () => <Pressable onPress={() => navigation.navigate("Settings")} style={{ paddingRight: 20 }}><SettingsIcon color={isDark ? '#F5F7FA' : '#161718'} size={24} /></Pressable>
            })} />
            <Tab.Screen name="Progress" component={ProgressScreen} options={({ navigation }) => ({
                tabBarIcon: ({ color }) => <ProgressIcon color={color} />,
                headerRight: () => <Pressable onPress={() => navigation.navigate("Settings")} style={{ paddingRight: 20 }}><SettingsIcon color={isDark ? '#F5F7FA' : '#161718'} size={24} /></Pressable>
            })} />
        </Tab.Navigator>
    )
}