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

export default function JournalScreen() {
  const secondaryBlue = '#DCEEFF';

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
      postMealActivity: 'Walk',
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
      postMealActivity: 'None',
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
      postMealActivity,
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
  };

  const renderOption = (label, selectedValue, setSelectedValue) => {
    const isSelected = selectedValue === label;

    return (
      <Pressable
        key={label}
        style={[
          styles.optionButton,
          {
            backgroundColor: isSelected ? secondaryBlue : '#F5F7FA',
            borderColor: isSelected ? '#7BB7FF' : '#D9E2EC',
          },
        ]}
        onPress={() => setSelectedValue(label)}
      >
        <Text style={styles.optionText}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Daily Journal</Text>
      <Text style={styles.subtitle}>
        Log how your food choices and habits may have affected your day
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionHeading}>How You Felt Today</Text>

        <Text style={styles.sectionTitle}>Energy</Text>
        <View style={styles.optionsRow}>
          {['High', 'Medium', 'Low'].map((item) =>
            renderOption(item, energy, setEnergy)
          )}
        </View>

        <Text style={styles.sectionTitle}>Mood</Text>
        <View style={styles.optionsRow}>
          {['Good', 'Okay', 'Low'].map((item) =>
            renderOption(item, mood, setMood)
          )}
        </View>

        <Text style={styles.sectionHeading}>Food Awareness</Text>

        <Text style={styles.sectionTitle}>Meal Balance</Text>
        <View style={styles.optionsRow}>
          {['Balanced', 'Mixed', 'Poor'].map((item) =>
            renderOption(item, mealBalance, setMealBalance)
          )}
        </View>

        <Text style={styles.sectionTitle}>Carb Awareness</Text>
        <View style={styles.optionsRow}>
          {['Aware', 'Somewhat aware', 'Not aware'].map((item) =>
            renderOption(item, carbAwareness, setCarbAwareness)
          )}
        </View>

        <Text style={styles.sectionTitle}>Sugar Cravings</Text>
        <View style={styles.optionsRow}>
          {['None', 'Mild', 'Strong'].map((item) =>
            renderOption(item, cravings, setCravings)
          )}
        </View>

        <Text style={styles.sectionTitle}>Hunger Level</Text>
        <View style={styles.optionsRow}>
          {['Low', 'Medium', 'High'].map((item) =>
            renderOption(item, hunger, setHunger)
          )}
        </View>

        <Text style={styles.sectionTitle}>Water Intake</Text>
        <View style={styles.optionsRow}>
          {['Low', 'Okay', 'Good'].map((item) =>
            renderOption(item, water, setWater)
          )}
        </View>

        <Text style={styles.sectionTitle}>Foods Scanned Today</Text>
        {scannedFoods.map((food) => (
          <View key={food.id} style={styles.foodCard}>
            <Text style={styles.foodName}>{food.name}</Text>
            <Text style={styles.foodText}>Barcode: {food.barcode}</Text>
            <Text style={styles.foodText}>Meal: {food.mealType}</Text>
            <Text style={styles.foodText}>Carbs: {food.carbs}</Text>
            <Text style={styles.foodText}>Sugars: {food.sugars}</Text>
          </View>
        ))}

        <Text style={styles.sectionHeading}>Lifestyle</Text>

        <Text style={styles.sectionTitle}>Post-Meal Activity</Text>
        <View style={styles.steps}>
            <Text>Steps Taken: {steps}</Text>
        </View>

        <Text style={styles.sectionTitle}>Notes</Text>
        <TextInput
          style={styles.input}
          placeholder="Optional note about meals, cravings, or energy today..."
          placeholderTextColor="#829AB1"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <Pressable style={styles.addButton} onPress={addEntry}>
          <Text style={styles.addButtonText}>Save Entry</Text>
        </Pressable>
      </View>

      <Text style={styles.recentHeading}>Recent Journal Entries</Text>

      {entries.map((entry) => (
        <View key={entry.id} style={styles.entryCard}>
          <Text style={styles.entryDate}>{entry.date}</Text>
          <Text style={styles.entryText}>Energy: {entry.energy}</Text>
          <Text style={styles.entryText}>Mood: {entry.mood}</Text>
          <Text style={styles.entryText}>Meal Balance: {entry.mealBalance}</Text>
          <Text style={styles.entryText}>
            Carb Awareness: {entry.carbAwareness}
          </Text>
          <Text style={styles.entryText}>Cravings: {entry.cravings}</Text>
          <Text style={styles.entryText}>Hunger: {entry.hunger}</Text>
          <Text style={styles.entryText}>Water: {entry.water}</Text>
          <Text style={styles.entryText}>
            Post-Meal Activity: {entry.postMealActivity}
          </Text>
          <Text style={styles.entryText}>
            Scanned Food: {entry.scannedFoodName}
          </Text>
          {entry.notes ? (
            <Text style={styles.entryNotes}>Notes: {entry.notes}</Text>
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
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2933',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#52606D',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E4E7EB',
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2933',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#243B53',
    marginBottom: 10,
    marginTop: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
    color: '#243B53',
    fontWeight: '500',
  },
  input: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: '#D9E2EC',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#102A43',
    backgroundColor: '#F8FBFF',
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
    color: '#102A43',
  },
  recentHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2933',
    marginBottom: 12,
  },
  foodCard: {
    backgroundColor: '#F8FBFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DCEEFF',
  },
  foodName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334E68',
    marginBottom: 8,
  },
  foodText: {
    fontSize: 14,
    color: '#486581',
    marginBottom: 4,
  },
  entryCard: {
    backgroundColor: '#F8FBFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DCEEFF',
  },
  entryDate: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334E68',
    marginBottom: 8,
  },
  entryText: {
    fontSize: 14,
    color: '#486581',
    marginBottom: 4,
  },
  entryNotes: {
    fontSize: 14,
    color: '#334E68',
    marginTop: 6,
    fontStyle: 'italic',
  },
});