import React, { useState, useEffect } from 'react';
import { Accelerometer} from 'expo-sensors';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemePreferenceContext } from '../context/ThemePreferenceContext';

export default function JournalScreen() {
  const { effectiveTheme } = React.useContext(ThemePreferenceContext);
  const isDark = effectiveTheme === 'dark';
  const colors = {
    page: isDark ? '#111315' : '#F8F9FB',
    card: isDark ? '#1B1D21' : '#FFFFFF',
    border: isDark ? '#2C3036' : '#E5E7EB',
    textPrimary: isDark ? '#F5F7FA' : '#111827',
    textSecondary: isDark ? '#D7DCE2' : '#4B5563',
    textMuted: isDark ? '#8A919B' : '#6B7280',
    accentSoft: isDark ? '#143020' : '#DCEEFF',
    accent: isDark ? '#22C55E' : '#2563EB',
  };

  const [energy, setEnergy] = useState('Medium');
  const [mood, setMood] = useState('Okay');
  const [mealBalance, setMealBalance] = useState('Mixed');
  const [carbAwareness, setCarbAwareness] = useState('Somewhat aware');
  const [cravings, setCravings] = useState('Mild');
  const [postMealActivity, setPostMealActivity] = useState('Light');
  const [water, setWater] = useState('Okay');
  const [hunger, setHunger] = useState('Medium');
  const [notes, setNotes] = useState('');
 // accelerometer
  const [accelsub, subset] = useState(false);
  const [steps, setSteps] = useState(0);
  const accelsubscribe = () => {
      Accelerometer.setUpdateInterval(300);
      const sub = Accelerometer.addListener((data) => {
        const movement = Math.sqrt(data.x*data.x + data.y*data.y + data.z*data.z);
        if (movement > 1.4){
          setSteps(steps => steps +1)
        }
        console.log(steps)
    });
    subset(sub)
  }
    const accelunsubscribe = () => {
      subscription && subscription.remove();
      subset(null);
    };
  const [scannedFoods] = useState([
    {
      id: 1,
      barcode: '8410076901026',
      name: 'Dummy Cereal Bar',
      mealType: 'Snack',
      carbs: '24g',
      sugars: '11g',
    },
  ]);

  const [entries, setEntries] = useState([
    {
      id: 1,
      date: 'Mon',
      energy: 'High',
      mood: 'Good',
      mealBalance: 'Balanced',
      carbAwareness: 'Aware',
      cravings: 'None',
      steps: '22',
      water: 'Good',
      hunger: 'Low',
      scannedFoodName: 'Dummy Cereal Bar',
      notes: 'Felt more stable after lunch and walk.',
    },
    {
      id: 2,
      date: 'Tue',
      energy: 'Medium',
      mood: 'Okay',
      mealBalance: 'Mixed',
      carbAwareness: 'Somewhat aware',
      cravings: 'Strong',
      steps: '26',
      water: 'Low',
      hunger: 'High',
      scannedFoodName: 'Dummy Cereal Bar',
      notes: 'More cravings in evening after a sugary snack.',
    },
  ]);

  useEffect(() => {
      accelsubscribe();
  }, []);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const savedEntries = await AsyncStorage.getItem('journalEntries');
      if (savedEntries !== null) {
        setEntries(JSON.parse(savedEntries));
      }
    } catch (error) {
      console.log('Error loading journal entries:', error);
    }
  };

  const addEntry = async () => {
    const today = new Date().toLocaleDateString('en-GB', {
      weekday: 'short',
    });

    const newEntry = {
      id: Date.now(),
      date: today,
      energy,
      mood,
      mealBalance,
      carbAwareness,
      cravings,
      steps,
      water,
      hunger,
      scannedFoodName: scannedFoods[0]?.name || 'None',
      notes,
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    setNotes('');

    try {
      await AsyncStorage.setItem(
        'journalEntries',
        JSON.stringify(updatedEntries)
      );
    } catch (error) {
      console.log('Error saving journal entries:', error);
    }
    setSteps(0);
  };

  const renderOption = (label, selectedValue, setSelectedValue) => {
    const isSelected = selectedValue === label;

    return (
      <Pressable
        key={label}
        style={[
          styles.optionButton,
          {
            backgroundColor: isSelected ? colors.accentSoft : colors.card,
            borderColor: isSelected ? colors.accent : colors.border,
          },
        ]}
        onPress={() => setSelectedValue(label)}
      >
        <Text
          style={[
            styles.optionText,
            { color: isSelected ? colors.accent : colors.textMuted },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.page }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Daily Journal</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Log how your food choices and habits may have affected your day
      </Text>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>How You Felt Today</Text>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Energy</Text>
        <View style={styles.optionsRow}>
          {['High', 'Medium', 'Low'].map((item) =>
            renderOption(item, energy, setEnergy)
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Mood</Text>
        <View style={styles.optionsRow}>
          {['Good', 'Okay', 'Low'].map((item) =>
            renderOption(item, mood, setMood)
          )}
        </View>

        <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Food Awareness</Text>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Meal Balance</Text>
        <View style={styles.optionsRow}>
          {['Balanced', 'Mixed', 'Poor'].map((item) =>
            renderOption(item, mealBalance, setMealBalance)
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Carb Awareness</Text>
        <View style={styles.optionsRow}>
          {['Aware', 'Somewhat aware', 'Not aware'].map((item) =>
            renderOption(item, carbAwareness, setCarbAwareness)
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Sugar Cravings</Text>
        <View style={styles.optionsRow}>
          {['None', 'Mild', 'Strong'].map((item) =>
            renderOption(item, cravings, setCravings)
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Hunger Level</Text>
        <View style={styles.optionsRow}>
          {['Low', 'Medium', 'High'].map((item) =>
            renderOption(item, hunger, setHunger)
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Water Intake</Text>
        <View style={styles.optionsRow}>
          {['Low', 'Okay', 'Good'].map((item) =>
            renderOption(item, water, setWater)
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Foods Scanned Today</Text>
        {scannedFoods.map((food) => (
          <View key={food.id} style={[styles.foodCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.foodName, { color: colors.textPrimary }]}>{food.name}</Text>
            <Text style={[styles.foodText, { color: colors.textSecondary }]}>Barcode: {food.barcode}</Text>
            <Text style={[styles.foodText, { color: colors.textSecondary }]}>Meal: {food.mealType}</Text>
            <Text style={[styles.foodText, { color: colors.textSecondary }]}>Carbs: {food.carbs}</Text>
            <Text style={[styles.foodText, { color: colors.textSecondary }]}>Sugars: {food.sugars}</Text>
          </View>
        ))}

        <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Lifestyle</Text>

        <Text style={styles.sectionTitle}>Post-Meal Activity</Text>
        <View style={styles.steps}>
            <Text>Steps Taken: {steps}</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Notes</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.textPrimary, borderColor: colors.border }]}
          placeholder="Optional note about meals, cravings, or energy today..."
          placeholderTextColor={colors.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <Pressable style={[styles.addButton, { backgroundColor: colors.accentSoft }]} onPress={addEntry}>
          <Text style={[styles.addButtonText, { color: colors.textPrimary }]}>Save Entry</Text>
        </Pressable>
      </View>

      <Text style={[styles.recentHeading, { color: colors.textPrimary }]}>Recent Journal Entries</Text>

      {entries.map((entry) => (
        <View key={entry.id} style={[styles.entryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.entryDate, { color: colors.textSecondary }]}>{entry.date}</Text>
          <Text style={[styles.entryText, { color: colors.textSecondary }]}>Energy: {entry.energy}</Text>
          <Text style={[styles.entryText, { color: colors.textSecondary }]}>Mood: {entry.mood}</Text>
          <Text style={[styles.entryText, { color: colors.textSecondary }]}>Meal Balance: {entry.mealBalance}</Text>
          <Text style={[styles.entryText, { color: colors.textSecondary }]}>
            Carb Awareness: {entry.carbAwareness}
          </Text>
          <Text style={[styles.entryText, { color: colors.textSecondary }]}>Cravings: {entry.cravings}</Text>
          <Text style={[styles.entryText, { color: colors.textSecondary }]}>Hunger: {entry.hunger}</Text>
          <Text style={[styles.entryText, { color: colors.textSecondary }]}>Water: {entry.water}</Text>
          <Text style={[styles.entryText, { color: colors.textSecondary }]}>
            Post-Meal Activity: {entry.steps} Steps
          </Text>
          <Text style={[styles.entryText, { color: colors.textSecondary }]}>
            Scanned Food: {entry.scannedFoodName}
          </Text>
          {entry.notes ? (
            <Text style={[styles.entryNotes, { color: colors.textSecondary }]}>Notes: {entry.notes}</Text>
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#F8F9FB',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 10,
    marginTop: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  optionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
  },
  optionText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },
  input: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
  },
  addButton: {
    marginTop: 18,
    backgroundColor: '#DCEEFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  recentHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  foodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  foodName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  foodText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  entryDate: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 8,
  },
  entryText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  entryNotes: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 6,
    fontStyle: 'italic',
  },
});