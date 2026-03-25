import React, { useState } from 'react';

export const ScannedFoodContext = React.createContext({
  scannedFoods: [],
  setScannedFoods: () => {},
  addScannedFood: () => {},
  deleteScannedFoods: () => [],
  journalScannedFoods: [],
  setJournalScannedFoods: () => {},
  addJournalScannedFood: () => {},
  deleteJournalScannedFoods: () => [],
  addRecentScannedFood: () => {},
});

export const ScannedFoodProvider = ({ children }) => {
  const [scannedFoods, setScannedFoods] = useState([]);
  const addScannedFood = (food) => {
    setScannedFoods((prevFoods) => [...prevFoods, food]);
  };

  return (
    <ScannedFoodContext.Provider value={{ scannedFoods, setScannedFoods, addScannedFood }}>
      {children}
    </ScannedFoodContext.Provider>
  );
};