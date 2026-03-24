import React, { useState } from 'react';

export const PlanContext = React.createContext({
  selectedPlan: '',
  setSelectedPlan: () => {},
});

export const PlanProvider = ({ children }) => {
  const [selectedPlan, setSelectedPlan] = useState('14-Day Balanced Plate Plan');

  return (
    <PlanContext.Provider value={{ selectedPlan, setSelectedPlan }}>
      {children}
    </PlanContext.Provider>
  );
};