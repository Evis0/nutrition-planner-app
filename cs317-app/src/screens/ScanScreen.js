import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function ScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  if (!permission) {
  return <Text>Requesting permission...</Text>;
  }

  if (!permission.granted) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Camera Permission Required</Text>
      <Button title="Grant Permission" onPress={requestPermission} />
    </View>
    );
  } 
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Awareness</Text>
      <Text style={styles.title}>Scan</Text>
      <Text style={styles.title}>this is not medical advice</Text>
      <CameraView style={styles.camera} />
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
  camera: {
  width: '90%',
  height: 600,
  marginTop: 20,
  borderRadius: 12,
  overflow: 'hidden',
},
});

