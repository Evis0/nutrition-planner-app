import React, { useContext, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import { ThemePreferenceContext } from '../context/ThemePreferenceContext';
import { PlanContext } from '../context/PlanContext';

export default function ProgressScreen() {
  const { effectiveTheme } = useContext(ThemePreferenceContext);
  const { selectedPlan } = useContext(PlanContext);

  const isDark = effectiveTheme === 'dark';
  const colors = {
    background: isDark ? '#111315' : '#F8F9FB',
    card: isDark ? '#1B1D21' : '#FFFFFF',
    text: isDark ? '#F5F7FA' : '#111827',
    subText: isDark ? '#C7CCD4' : '#4B5563',
    good: '#22C55E',
    mid: '#F59E0B',
    bad: '#EF4444',
  };

  const [entries, setEntries] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      loadEntries();
    }, []));

  const loadEntries = async () => {
    const saved = await AsyncStorage.getItem('journalEntries');
    if (saved) setEntries(JSON.parse(saved));
  };

  // calculates the score based on latest journal entry
  const scoreData = useMemo(() => {
    if (entries.length === 0) return { score: 0, label: "No data yet :(" };

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
      if (latest.cravings === 'None') score += 50;
      if (latest.mealBalance === 'Balanced') score += 50;

    } else if (selectedPlan === 'Weekly Review Plan') { score = 100; }

    return {
      score,
      label:
        score > 70 ? "On track with your goal! 🎯" :
          score > 40 ? "Partially on track 👍" :
            "Not aligned with your goal ⚠️"
    };
  }, [entries, selectedPlan]);

  // checks what journal days align with the user's goal
  const weeklyData = useMemo(() => {
    if (entries.length === 0) return { alignedDays: 0, total: 0 }

    let alignedDays = 0;

    entries.forEach(entry => {
      let aligned = false;

      if (selectedPlan === '14-Day Balanced Plate Plan') { aligned = entry.mealBalance === 'Balanced';
      } else if (selectedPlan === 'Low-GI Swap Plan') {aligned = entry.cravings === 'None';
      } else if (selectedPlan === 'Safe Weekly Fitness Plan') { aligned = Number(entry.steps) > 20;
      } else if (selectedPlan === 'Low-Sugar Prevention Plan') { aligned = entry.cravings === 'None';
      } else if (selectedPlan === 'Weekly Review Plan') { aligned = true; }
      if (aligned) alignedDays++;
    });

    return {
      alignedDays,
      total:entries.length
    };
  }, 
  [entries, selectedPlan]);

  return (
    <ScrollView style={{ backgroundColor: colors.background }}>

      {/* displays current user goal */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Current Goal
        </Text>
        <Text style={{ color: colors.subText }}>
          {selectedPlan}
        </Text>
        <Text style={{ color: colors.subText }}>
          {'\nChange your goal in settings'}
        </Text>
      </View>

      {/* displays progress score */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Progress (Latest Entry)
        </Text>

        <Text style={[styles.score,
        {
          color:
            scoreData.score > 70 ? colors.good :
              scoreData.score > 40 ? colors.mid :
                colors.bad
        }]}>
          {scoreData.score}%
        </Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>
          {scoreData.label}
        </Text>
      </View>

      {/* displays the weekly goal alignment */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Weekly Consistency
        </Text>

        <Text style={{ color: colors.subText }}>
          {weeklyData.alignedDays}/{weeklyData.total} days on track
        </Text>

        <Text style={{ color: colors.subText }}>
          {weeklyData.total === 0
            ? "No data yet" : weeklyData.alignedDays/ weeklyData.total >= 0.7
            ? "Strong consistency! 💪" : weeklyData.alignedDays / weeklyData.total >= 0.4
            ? "Moderate consistency 👍" : "Needs more consistency ⚠️"}
        </Text>
       </View>

      <Text style={[styles.disclaimerText, { color: colors.subText }]}>
        This app is for informational tracking only and is not medical advice.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    padding: 20,
    borderRadius:16,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  score: {
    fontSize:48,
    fontWeight: 'bold',
    marginVertical: 10,
  },

  subtitle: {
    fontSize: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight:"600",
    marginBottom: 10,
  },
  disclaimerText: {
    fontSize: 12,
    textAlign: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
  },
});