import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { ThemePreferenceContext } from '../context/ThemePreferenceContext';
import { ScannedFoodContext } from '../context/ScannedFoodContext';
import { PlanContext } from '../context/PlanContext';

export default function HomeScreen({ navigation }) {
  const { effectiveTheme } = React.useContext(ThemePreferenceContext);
  const { scannedFoods } = React.useContext(ScannedFoodContext);
  const { selectedPlan } = React.useContext(PlanContext);
  const [entries, setEntries] = React.useState([]);

  const isDark = effectiveTheme === 'dark';
  const colors = {
    page: isDark ? '#111315' : '#F8F9FB',
    card: isDark ? '#1B1D21' : '#FFFFFF',
    border: isDark ? '#2C3036' : '#E5E7EB',
    textPrimary: isDark ? '#F5F7FA' : '#111827',
    textSecondary: isDark ? '#C7CCD4' : '#4B5563',
    textMuted: isDark ? '#8A919B' : '#6B7280',
    accent: isDark ? '#22C55E' : '#2563EB',
    accentSoft: isDark ? '#143020' : '#DCEEFF',
    dangerSoft: isDark ? '#3A1D1D' : '#FDECEC',
    good: '#22C55E',
    mid: '#F59E0B',
    bad: '#EF4444',
  };

  useFocusEffect(
    React.useCallback(() => {
      const loadEntries = async () => {
        try {
          const savedEntries = await AsyncStorage.getItem('journalEntries');
          if (savedEntries) {
            setEntries(JSON.parse(savedEntries));
          } else {
            setEntries([]);
          }
        } catch (error) {
          console.log('Error loading entries on home:', error);
        }
      };

      loadEntries();
    }, [])
  );

  const progressPercent = React.useMemo(() => {
    if (entries.length === 0) {
      return 0;
    }

    const latest = entries[0];
    let score = 0;

    if (selectedPlan === '14-Day Balanced Plate Plan') {
      if (latest.mealBalance === 'Balanced') score += 40;
      if (latest.energy === 'High') score += 30;
      if (latest.cravings === 'None') score += 30;
    } else if (selectedPlan === 'Low-GI Swap Plan') {
      if (latest.cravings === 'None') score += 50;
      if (latest.mealBalance === 'Balanced') score += 50;
    } else if (selectedPlan === 'Safe Weekly Fitness Plan') {
      if (Number(latest.steps) > 20) score += 60;
      if (latest.energy === 'High') score += 40;
    } else if (selectedPlan === 'Low-Sugar Prevention Plan') {
      if (latest.cravings === 'None') score += 15;
      if (latest.mealBalance === 'Balanced') score += 10;
    } else if (selectedPlan === 'Weekly Review Plan') {
      score = 100;
    }

    return score;
  }, [entries, selectedPlan]);

  const recentScannedFoods = React.useMemo(() => scannedFoods.slice(-5).reverse(), [scannedFoods]);

  const progressColor = React.useMemo(() => {
    if (progressPercent > 70) {
      return colors.good;
    }

    if (progressPercent > 40) {
      return colors.mid;
    }

    return colors.bad;
  }, [progressPercent, colors.good, colors.mid, colors.bad]);

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.page }]}> 
      <Text style={[styles.title, { color: colors.textPrimary }]}>Food Awareness</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Your daily snapshot at a glance.</Text>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Goal Progress</Text>
        <Text style={[styles.goalName, { color: colors.accent }]}>{selectedPlan}</Text>
        <Text style={[styles.progressNumber, { color: progressColor }]}>{progressPercent}%</Text>
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}> 
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.max(0, Math.min(progressPercent, 100))}%`,
                backgroundColor: progressColor,
              },
            ]}
          />
        </View>
        <Text style={[styles.helperText, { color: colors.textMuted }]}>Based on your latest journal entry.</Text>
      </View>

      <View style={styles.quickStatsRow}>
        <View style={[styles.miniCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>Journal Entries</Text>
          <Text style={[styles.miniValue, { color: colors.textPrimary }]}>{entries.length}</Text>
        </View>
        <View style={[styles.miniCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>Scanned Items</Text>
          <Text style={[styles.miniValue, { color: colors.textPrimary }]}>{scannedFoods.length}</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Recent Scans</Text>

        {recentScannedFoods.length === 0 ? (
          <Text style={[styles.helperText, { color: colors.textMuted }]}>No scanned items yet. Scan food to populate this list.</Text>
        ) : (
          recentScannedFoods.map((food) => (
            <View key={food.id} style={[styles.foodRow, { borderColor: colors.border }]}> 
              <View style={styles.foodMain}> 
                <Text style={[styles.foodName, { color: colors.textPrimary }]}>{food.name || 'Unknown product'}</Text>
                <Text style={[styles.foodMeta, { color: colors.textSecondary }]}>Meal: {food.mealType || 'N/A'} | Carbs: {food.carbs || 'N/A'} | Sugars: {food.sugars || 'N/A'}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.actionButton, { backgroundColor: colors.accentSoft, borderColor: colors.border }]}
          onPress={() => navigation.navigate('Scan')}
        >
          <Text style={[styles.actionButtonText, { color: colors.textPrimary }]}>Scan Food</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate('Journal')}
        >
          <Text style={[styles.actionButtonText, { color: colors.textPrimary }]}>Open Journal</Text>
        </Pressable>
      </View>

      <Text style={[styles.disclaimer, { color: colors.textMuted }]}>This app is for informational tracking only and is not medical advice.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4,
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  goalName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressNumber: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 8,
  },
  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 99,
  },
  helperText: {
    fontSize: 13,
    marginTop: 8,
  },
  quickStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  miniCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  miniLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  miniValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  foodRow: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  foodMain: {
    gap: 4,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '700',
  },
  foodMeta: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
  },
});
