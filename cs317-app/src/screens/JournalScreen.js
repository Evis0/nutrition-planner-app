import React, { useState, useEffect } from 'react';
import { Accelerometer} from 'expo-sensors';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemePreferenceContext } from '../context/ThemePreferenceContext';
import {ScannedFoodContext} from '../context/ScannedFoodContext';

export default function JournalScreen() {
  const LIVE_STEPS_STORAGE_KEY = 'journalLiveSteps';
  const DRAFT_ENTRY_STORAGE_KEY = 'journalDraftEntry';

  const getTodayLabel = () =>
    new Date().toLocaleDateString('en-GB', {
      weekday: 'short',
    });

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
  const [editingEntryId, setEditingEntryId] = useState(null);
  // accelerometer
  const [steps, setSteps] = useState(0);
  const [isStepsHydrated, setIsStepsHydrated] = useState(false);
  const [isDraftHydrated, setIsDraftHydrated] = useState(false);
  // const [scannedFoods] = useState([
  //   {
  //     id: 1,
  //     barcode: '8410076901026',
  //     name: 'Dummy Cereal Bar',
  //     mealType: 'Snack',
  //     carbs: '24g',
  //     sugars: '11g',
  //   },
  // ]);

  const {scannedFoods} = React.useContext(ScannedFoodContext);

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
    const initializeScreen = async () => {
      await Promise.all([loadEntries(), loadLiveSteps(), loadDraftEntry()]);
    };

    initializeScreen();
  }, []);

  useEffect(() => {
    Accelerometer.setUpdateInterval(300);
    const subscription = Accelerometer.addListener((data) => {
      const movement = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
      if (movement > 1.4) {
        setSteps((currentSteps) => currentSteps + 1);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!isStepsHydrated) {
      return;
    }

    persistLiveSteps(steps);
  }, [steps, isStepsHydrated]);

  useEffect(() => {
    if (!isDraftHydrated) {
      return;
    }

    persistDraftEntry({
      energy,
      mood,
      mealBalance,
      carbAwareness,
      cravings,
      water,
      hunger,
      notes,
    });
  }, [
    energy,
    mood,
    mealBalance,
    carbAwareness,
    cravings,
    water,
    hunger,
    notes,
    isDraftHydrated,
  ]);

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

  const loadLiveSteps = async () => {
    try {
      const savedStepsRaw = await AsyncStorage.getItem(LIVE_STEPS_STORAGE_KEY);

      if (!savedStepsRaw) {
        setIsStepsHydrated(true);
        return;
      }

      const savedSteps = JSON.parse(savedStepsRaw);
      const today = getTodayLabel();

      if (savedSteps?.date === today) {
        setSteps(Number(savedSteps.steps) || 0);
      } else {
        setSteps(0);
      }
    } catch (error) {
      console.log('Error loading live steps:', error);
    } finally {
      setIsStepsHydrated(true);
    }
  };

  const persistLiveSteps = async (nextSteps) => {
    try {
      const payload = {
        date: getTodayLabel(),
        steps: Number(nextSteps) || 0,
      };
      await AsyncStorage.setItem(LIVE_STEPS_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.log('Error saving live steps:', error);
    }
  };

  const loadDraftEntry = async () => {
    try {
      const savedDraftRaw = await AsyncStorage.getItem(DRAFT_ENTRY_STORAGE_KEY);

      if (!savedDraftRaw) {
        setIsDraftHydrated(true);
        return;
      }

      const savedDraft = JSON.parse(savedDraftRaw);
      const today = getTodayLabel();

      if (savedDraft?.date !== today || !savedDraft?.draft) {
        setIsDraftHydrated(true);
        return;
      }

      const draft = savedDraft.draft;
      if (draft.energy) setEnergy(draft.energy);
      if (draft.mood) setMood(draft.mood);
      if (draft.mealBalance) setMealBalance(draft.mealBalance);
      if (draft.carbAwareness) setCarbAwareness(draft.carbAwareness);
      if (draft.cravings) setCravings(draft.cravings);
      if (draft.water) setWater(draft.water);
      if (draft.hunger) setHunger(draft.hunger);
      if (typeof draft.notes === 'string') setNotes(draft.notes);
    } catch (error) {
      console.log('Error loading entry draft:', error);
    } finally {
      setIsDraftHydrated(true);
    }
  };

  const persistDraftEntry = async (draft) => {
    try {
      const payload = {
        date: getTodayLabel(),
        draft,
      };
      await AsyncStorage.setItem(DRAFT_ENTRY_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.log('Error saving entry draft:', error);
    }
  };

  const persistEntries = async (nextEntries) => {
    try {
      await AsyncStorage.setItem('journalEntries', JSON.stringify(nextEntries));
    } catch (error) {
      console.log('Error saving journal entries:', error);
      Alert.alert('Save failed', 'Could not save changes. Please try again.');
    }
  };

  const applyEntryToForm = (entry) => {
    setEnergy(entry.energy);
    setMood(entry.mood);
    setMealBalance(entry.mealBalance);
    setCarbAwareness(entry.carbAwareness);
    setCravings(entry.cravings);
    setWater(entry.water);
    setHunger(entry.hunger);
    setNotes(entry.notes || '');
    setSteps(Number(entry.steps) || 0);
    setEditingEntryId(entry.id);
  };

  const saveEntry = async () => {
    const today = getTodayLabel();

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

    const existingTodayEntry = entries.find((entry) => entry.date === today);
    let updatedEntries = [];

    if (editingEntryId !== null) {
      updatedEntries = entries.map((entry) =>
        entry.id === editingEntryId
          ? {
              ...entry,
              ...newEntry,
              id: entry.id,
              date: entry.date,
            }
          : entry
      );
      setEditingEntryId(null);
      Alert.alert('Success', 'Entry updated successfully.');
    } else if (existingTodayEntry) {
      updatedEntries = entries.map((entry) =>
        entry.id === existingTodayEntry.id
          ? {
              ...entry,
              ...newEntry,
              id: entry.id,
              date: entry.date,
            }
          : entry
      );
      Alert.alert('Success', 'Today\'s entry updated successfully.');
    } else {
      updatedEntries = [newEntry, ...entries];
      Alert.alert('Success', 'Entry saved successfully.');
    }

    setEntries(updatedEntries);
    setNotes('');
    await persistEntries(updatedEntries);
    await persistDraftEntry({
      energy,
      mood,
      mealBalance,
      carbAwareness,
      cravings,
      water,
      hunger,
      notes: '',
    });
  };

  const confirmDeleteEntry = (entryId) => {
    Alert.alert('Delete entry', 'Are you sure you want to delete this entry?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updatedEntries = entries.filter((entry) => entry.id !== entryId);
          setEntries(updatedEntries);

          if (editingEntryId === entryId) {
            setEditingEntryId(null);
          }

          await persistEntries(updatedEntries);
          Alert.alert('Success', 'Entry deleted successfully.');
        },
      },
    ]);
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
      <Text style={[styles.autoSaveNotice, { color: colors.textMuted }]}>
        Auto-save is on: your selections and step count are saved automatically.
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

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Post-Meal Activity</Text>
        <View style={styles.steps}>
            <Text style={{ color: colors.textPrimary }}>Steps Taken: {steps}</Text>
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

        <Pressable style={[styles.addButton, { backgroundColor: colors.accentSoft }]} onPress={saveEntry}>
          <Text style={[styles.addButtonText, { color: colors.textPrimary }]}>
            {editingEntryId !== null ? 'Update Entry' : 'Keep Record of Entry'}
          </Text>
        </Pressable>

        {editingEntryId !== null ? (
          <Pressable
            style={[styles.cancelEditButton, { borderColor: colors.border }]}
            onPress={() => {
              setEditingEntryId(null);
              Alert.alert('Edit canceled', 'You can select an entry to edit again anytime.');
            }}
          >
            <Text style={[styles.cancelEditButtonText, { color: colors.textSecondary }]}>Cancel Edit</Text>
          </Pressable>
        ) : null}
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
          <View style={styles.entryActionsRow}>
            <Pressable
              style={[styles.entryEditButton, styles.entryActionButton, { borderColor: colors.border }]}
              onPress={() => applyEntryToForm(entry)}
            >
              <Text style={[styles.entryEditButtonText, { color: colors.textSecondary }]}>Edit Entry</Text>
            </Pressable>
            <Pressable
              style={[styles.entryDeleteButton, styles.entryActionButton, { borderColor: colors.border }]}
              onPress={() => confirmDeleteEntry(entry.id)}
            >
              <Text style={styles.entryDeleteButtonText}>Delete Entry</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <Text style={[styles.disclaimerText, { color: colors.textMuted }]}>This app is for informational tracking only and is not medical advice.</Text>
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
    marginBottom: 8,
  },
  autoSaveNotice: {
    fontSize: 13,
    marginBottom: 16,
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
  cancelEditButton: {
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelEditButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
  entryEditButton: {
    marginTop: 10,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  entryDeleteButton: {
    marginTop: 10,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: '#FEE2E2',
  },
  entryActionButton: {
    flex: 1,
  },
  entryActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  entryEditButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  entryDeleteButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B91C1C',
  },
  disclaimerText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
});