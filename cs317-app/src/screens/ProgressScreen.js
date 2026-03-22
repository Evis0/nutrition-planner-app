import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemePreferenceContext } from '../context/ThemePreferenceContext';

export default function ProgressScreen({ navigation }) {
  const { effectiveTheme } = React.useContext(ThemePreferenceContext);
  const isDark = effectiveTheme === 'dark';
  const colors = {
    background: isDark ? '#111315' : '#F8F9FB',
    title: isDark ? '#F5F7FA' : '#111827',
    subtitle: isDark ? '#C7CCD4' : '#111827',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.title }]}>Food Awareness</Text>
      <Text style={[styles.title, { color: colors.subtitle }]}>this is not medical advice</Text>
    </View>
  ); 
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
