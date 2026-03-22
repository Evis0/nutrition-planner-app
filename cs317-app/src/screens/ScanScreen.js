import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ThemePreferenceContext } from '../context/ThemePreferenceContext';




export default function ScanScreen({ navigation }) {
  const { effectiveTheme } = React.useContext(ThemePreferenceContext);
  const isDark = effectiveTheme === 'dark';
  const colors = {
    background: isDark ? '#111315' : '#F8F9FB',
    title: isDark ? '#F5F7FA' : '#111827',
    subtitle: isDark ? '#C7CCD4' : '#111827',
    text: isDark ? '#E5E7EB' : '#111827',
  };
  const [scanned, setScanned] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const handleBarcodeScanned = async ({ type, data }) => {
    setScanned(true);
    setBarcode(data);
    setLoading(true);
    setOverlayVisible(true);
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
  const sugarColour = (product) => {
    if(!product){
      return 'rgba(0,0,0,0.5)';
    }

    const sugar = product.nutriments.sugars_100g

    if(sugar < 5) {
      return 'rgba(0,175,0,0.5)';
    } else if(sugar < 15) {
      return 'rgba(255,165,0,0.5)';
    } else {
      return 'rgba(212, 4, 4, 0.5)';
    }
  }

  if (!permission) {
  return <Text style={{ color: colors.title }}>Requesting permission...</Text>;
  }

  if (!permission.granted) {
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.title }]}>Camera Permission Required</Text>
      <Button title="Grant Permission" onPress={requestPermission} />
    </View>
    );
  } 
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.title }]}>Food Awareness</Text>
      <Text style={[styles.title, { color: colors.title }]}>this is not medical advice</Text>
      <View style={styles.cameraContainer}>
      <CameraView
       style={styles.camera}
       onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />
      <View style={styles.barcodeBox} />
      </View>

      {barcode ? <Text style={[styles.result, { color: colors.text }]}>Scanned barcode: {barcode}</Text> : null}

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
        <View style = {[
          styles.modalOverlay,
          {backgroundColor: sugarColour(product)}
        ]}>
          <View style = {[styles.modalBox, { backgroundColor: colors.card }]}>
            {loading ? (
              <ActivityIndicator size = "large"/>

            ) : product ? (
              <>
                <Text style = {[styles.modalTitle, { color: colors.title }]}>{product.product_name || "Unknown Product"}</Text>
                <Text style={{ color: colors.text }}>FILL THIS WITH INFO</Text>
              </>
            ) : (
              <Text style={{ color: colors.text }}>Product not found in OpenFoodFacts</Text>
            )}
            <Button
              title = "Close" onPress={() => {
                setOverlayVisible(false);
                setProduct(null);
                setBarcode('');
                setScanned(false);
              }}
            ></Button>
          </View>
        </View>
      </Modal>
    </View>
  ); 
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
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
  color: '#111827',
},
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center'
},
modalBox: {
  width: '80%',
  height: 250,
  backgroundColor: '#FFFFFF',
  borderRadius:12,
  padding:24,
  justifyContent: 'space-between',
  alignItems: 'center'
},
modalTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  marginBottom: 8,
  color: '#111827'
}
});

