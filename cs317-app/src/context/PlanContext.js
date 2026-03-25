import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PLAN_STORAGE_KEY = 'selectedGoalPlan';
const SETTINGS_STORAGE_KEY = 'settingsData';
const DEFAULT_PLAN = '14-Day Balanced Plate Plan';

export const PlanContext = React.createContext({
  selectedPlan: '',
  setSelectedPlan: () => {},
});

export const PlanProvider = ({ children }) => {
  const [selectedPlan, setSelectedPlan] = useState(DEFAULT_PLAN);
  const [isPlanHydrated, setIsPlanHydrated] = useState(false);

  useEffect(() => {
    const loadSelectedPlan = async () => {
      try {
        const storedPlan = await AsyncStorage.getItem(PLAN_STORAGE_KEY);
        if (storedPlan) {
          setSelectedPlan(storedPlan);
          return;
        }

        const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          if (parsedSettings?.selectedPlan) {
            setSelectedPlan(parsedSettings.selectedPlan);
          }
        }
      } catch (error) {
        console.log('Error loading selected plan:', error);
      } finally {
        setIsPlanHydrated(true);
      }
    };

    loadSelectedPlan();
  }, []);

  useEffect(() => {
    if (!isPlanHydrated) {
      return;
    }

    const persistSelectedPlan = async () => {
      try {
        await AsyncStorage.setItem(PLAN_STORAGE_KEY, selectedPlan || DEFAULT_PLAN);
      } catch (error) {
        console.log('Error saving selected plan:', error);
      }
    };

    persistSelectedPlan();
  }, [selectedPlan, isPlanHydrated]);

  return (
    <PlanContext.Provider value={{ selectedPlan, setSelectedPlan }}>
      {children}
    </PlanContext.Provider>
  );
};