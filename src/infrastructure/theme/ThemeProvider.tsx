// Theme Provider - React Context for theming
// Provides theme to all components with light/dark mode support

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Theme, lightTheme, darkTheme } from './theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  initialMode?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children,
  initialMode = 'system',
}) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialMode);
  
  // Determine if dark mode should be active
  const isDark = themeMode === 'system' 
    ? systemColorScheme === 'dark' 
    : themeMode === 'dark';
  
  // Select theme based on mode
  const theme = isDark ? darkTheme : lightTheme;

  // Toggle between light and dark (not system)
  const toggleTheme = () => {
    setThemeMode(current => {
      if (current === 'system') {
        return systemColorScheme === 'dark' ? 'light' : 'dark';
      }
      return current === 'dark' ? 'light' : 'dark';
    });
  };

  const value: ThemeContextValue = {
    theme,
    isDark,
    themeMode,
    setThemeMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access theme in any component
 * 
 * @example
 * const { theme, isDark, toggleTheme } = useTheme();
 * 
 * <View style={{ backgroundColor: theme.background.primary }}>
 *   <Text style={{ color: theme.text.primary }}>Hello</Text>
 * </View>
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

/**
 * Hook to get theme-aware styles
 * 
 * @example
 * const styles = useThemedStyles((theme) => ({
 *   container: {
 *     backgroundColor: theme.background.primary,
 *     padding: theme.spacing[4],
 *   },
 * }));
 */
export const useThemedStyles = <T extends Record<string, any>>(
  createStyles: (theme: Theme) => T
): T => {
  const { theme } = useTheme();
  return createStyles(theme);
};

