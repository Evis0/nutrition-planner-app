import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function ScanScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Awareness</Text>
      <Text style={styles.title}>Scan</Text>
      <Text style={styles.title}>this is not medical advice</Text>
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
