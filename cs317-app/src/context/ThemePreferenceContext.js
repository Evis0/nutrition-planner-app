import React from 'react';

export const ThemePreferenceContext = React.createContext({
  themePreference: 'system',
  effectiveTheme: 'light',
  setThemePreference: () => {},
});
