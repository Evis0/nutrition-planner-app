import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, ActivityIndicator, Modal, Alert, Pressable } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ThemePreferenceContext } from '../context/ThemePreferenceContext';
import { ScannedFoodContext } from '../context/ScannedFoodContext';




export default function ScanScreen({ navigation }) {
  const { effectiveTheme } = React.useContext(ThemePreferenceContext);
  const isDark = effectiveTheme === 'dark';
  const colors = {
    background: isDark ? '#111315' : '#F8F9FB',
    title: isDark ? '#F5F7FA' : '#111827',
    subtitle: isDark ? '#C7CCD4' : '#111827',
    text: isDark ? '#E5E7EB' : '#111827',
    card: isDark ? '#111315' : '#F8F9FB'
  };
  const {addScannedFood} = React.useContext(ScannedFoodContext);
  const [scanned, setScanned] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [zoom, setZoom] = useState(0);
  const [permission, requestPermission] = useCameraPermissions();

  const clampZoom = (value) => Math.max(0, Math.min(1, value));

  const updateZoom = (delta) => {
    setZoom((previousZoom) => {
      const nextZoom = clampZoom(previousZoom + delta);
      return Number(nextZoom.toFixed(2));
    });
  };

  const handleBarcodeScanned = async ({ type, data }) => {
    setScanned(true);
    setBarcode(data);
    setLoading(true);
    console.log('Barcode type:', type);
    console.log('Barcode data:', data);

    try {
      const apiResponse = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      const json = await apiResponse.json();

      if (json.status === 1){
        const fetchedProduct = json.product
  
        if(!checkProductValid(fetchedProduct)){
          setProduct(null)
          console.log("Check 1")
        } else {
          setProduct(fetchedProduct);
          addScannedFood(json.product);
          console.log("check2")
        }
        setOverlayVisible(true);
      } else {
        setProduct(null);
        setOverlayVisible(true);
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

  const handleAddToJournal = () => {
    if (!product) {
      return;
    }

    const productName = product.product_name || 'Product';
    Alert.alert('Saved in recent scans', `${productName} is already in your recent scans.`);
  };

  const sugarColour = (product) => {

    if(!product){
      return 'rgba(0,0,0,0.5)';
    }

    const sugar = product.nutriments.sugars_100g

    if(sugar < 5) {
      return 'rgba(0,175,0,0.5)';
    } else if(sugar < 15) {
      return 'rgba(255,165,0,0.5)';
    } else if(sugar >= 15) {
      return 'rgba(212, 4, 4, 0.5)';
    } else {
      return 'rgba(0, 17, 253, 0.5)';
    }
  }

  const checkProductValid = (product) => {
    if (!product) {
      return false
    } else if (product.nutriments.sugars_100g === undefined || product.nutrition_grades === undefined || product.nutriments.carbohydrates_100g === undefined) {
      return false
    } else {
      return true
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
      <Text style={[styles.disclaimerText, { color: colors.subtitle }]}>This app is for informational tracking only and is not medical advice.</Text>
    </View>
    );
  } 
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.title }]}>Food Awareness</Text>
      <View style={styles.cameraContainer}>
      <CameraView
       style={styles.camera}
       zoom={zoom}
       onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />
      <View style={styles.barcodeBox} />
      </View>

      <View style={styles.zoomControlsRow}>
        <Pressable style={styles.zoomButton} onPress={() => updateZoom(-0.1)}>
          <Text style={styles.zoomButtonText}>-</Text>
        </Pressable>
        <Text style={[styles.zoomText, { color: colors.text }]}>Zoom: {Math.round(zoom * 100)}%</Text>
        <Pressable style={styles.zoomButton} onPress={() => updateZoom(0.1)}>
          <Text style={styles.zoomButtonText}>+</Text>
        </Pressable>
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
                <Text style={{ color: colors.text }}>Nutri-score: {product.nutrition_grades.toUpperCase()}</Text>
                <Text style={{ color: colors.text }}>Sugar Content: {product.nutriments.sugars_100g}g</Text>
                <Text style={{ color: colors.text }}>Carb Content: {product.nutriments.carbohydrates_100g}g</Text>
                
              </>
              
            ) : (
              <Text style={{ color: colors.text }}>Product not found in OpenFoodFacts</Text>
            )}
            <View style = {styles.modalButtonGroup}>
              {product && (
                <Button
                  title = "Add to Journal"
                  onPress = {handleAddToJournal}
                ></Button>
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
        </View>
      </Modal>

      <Text style={[styles.disclaimerText, { color: colors.subtitle }]}>This app is for informational tracking only and is not medical advice.</Text>
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
},
modalButtonGroup: {
  flexDirection: 'row'
},
disclaimerText: {
  position: 'absolute',
  bottom: 10,
  fontSize: 12,
  textAlign: 'center',
  paddingHorizontal: 16,
},
zoomControlsRow: {
  width: '90%',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 10,
  gap: 14,
},
zoomButton: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: '#2563EB',
  alignItems: 'center',
  justifyContent: 'center',
},
zoomButtonText: {
  color: '#FFFFFF',
  fontSize: 24,
  fontWeight: '700',
  lineHeight: 25,
},
zoomText: {
  fontSize: 15,
  fontWeight: '600',
}
});

