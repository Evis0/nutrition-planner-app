import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function SettingsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Awareness</Text>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.title}>this is not medical advice</Text>

      <Button title="Home" onPress={() => navigation.navigate("Home")} />
      <Button title="Scan" onPress={() => navigation.navigate("Scan")} />
      <Button title="Journal" onPress={() => navigation.navigate("Journal")} />
      <Button title="Progress" onPress={() => navigation.navigate("Progress")} />
      <Button title ="Settings" onPress={() => navigation.navigate("Settings")} />
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
