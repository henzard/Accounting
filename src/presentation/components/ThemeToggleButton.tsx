// ThemeToggleButton Component - Homebase Budget
// Toggle button for switching between light and dark themes

import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/infrastructure/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface ThemeToggleButtonProps {
  size?: number;
  testID?: string;
}

export const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({
  size = 24,
  testID,
}) => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={[
        styles.button,
        {
          backgroundColor: theme.surface.default,
          borderColor: theme.border.default,
        },
      ]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      testID={testID}
    >
      <IconSymbol
        name={isDark ? 'sun.max' : 'moon'}
        size={size}
        color={theme.text.primary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
