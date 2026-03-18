import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';




export default function ScanScreen({ navigation }) {
  const [scanned, setScanned] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const handleBarcodeScanned = ({ type, data }) => {
  setScanned(true);
  setBarcode(data);
  console.log('Barcode type:', type);
  console.log('Barcode data:', data);
};
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
      <Text style={styles.title}>this is not medical advice</Text>
      <View style={styles.cameraContainer}>
      <CameraView
       style={styles.camera}
       onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />
      <View style={styles.barcodeBox} />
      </View>

      {barcode ? <Text style={styles.result}>Scanned barcode: {barcode}</Text> : null}

      {scanned && (
        <Button
          title="Scan Again"
          onPress={() => {
            setScanned(false);
            setBarcode('');
          }}
        />
      )}
      <View style={styles.barcodeBox} />
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
  cameraContainer: {
  width: '90%',
  height: 640,   
  marginTop: 20,
  position: 'relative',
},
camera: {
  width: '100%',
  height: '100%',
  borderRadius: 12,
  overflow: 'hidden',
},
barcodeBox: {
  position: 'absolute',
  top: '40%',
  left: '20%',
  width: '60%',
  height: 120,
  borderWidth: 3,
  borderColor: 'white',
  borderRadius: 10,
},
result: {
  fontSize: 16,
  marginTop: 20,
  marginBottom: 10,
  textAlign: 'center',
},
});

