import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';




export default function ScanScreen({ navigation }) {
  const [scanned, setScanned] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const handleBarcodeScanned = async ({ type, data }) => {
    setScanned(true);
    setBarcode(data);
    console.log('Barcode type:', type);
    console.log('Barcode data:', data);

    try {
      const apiResponse = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      const json = await apiResponse.json();

      if (json.status === 1){
        setProduct(json.product);

      } else {
        setProduct(null);
      }
    
    } catch (e) {
      setProduct(null);
    } finally {
      setLoading(false);
    }

  }

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);

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
    <ScrollView contentContainerStyle={styles.container}>
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
          title = "View Product"
          onPress={() =>{
            setOverlayVisible(true);
          }}
        />
      )}

      {scanned && (
        <Button
          title="Scan Again"
          onPress={() => {
            setScanned(false);
            setBarcode('');
            setProduct(null);
          }}
        />
      )}
      <Modal
        visible = {overlayVisible}
        transparent = {true}
        animationType = "slide"
        onRequestClose = {() => setOverlayVisible(false)}

      >
        <View style = {styles.modalOverlay}>
          <View style = {styles.modalBox}>
            {loading ? (
              <ActivityIndicator size = "large"/>

            ) : product ? (
              <>
                <Text style = {styles.modelTitle}>{product.product_name || "Unknown Product"}</Text>
                <Text>FILL THIS WITH INFO</Text>
              </>
            ) : (
              <Text>Product not found in OpenFoodFacts</Text>
            )}
            <Button
              title = "Close" onPress={() => setOverlayVisible(false)}
            ></Button>
          </View>

        </View>


      </Modal>
    </ScrollView>
  ); 
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center'

},
modalBox: {
  gap: 10,
  backgroundColor: 'white',
  justifyContent: 'center',
  alignItems: 'center'
},
modalTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  marginBottom: '8'
}
});

