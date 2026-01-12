// ScreenHeader Component - Homebase Budget
// Reusable header for all screens with consistent back button and styling

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemeToggleButton } from './ThemeToggleButton';
import { HouseholdSwitcherButton } from './HouseholdSwitcherButton';

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  showThemeToggle?: boolean;
  showHouseholdSwitcher?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  showBack = true,
  onBackPress,
  rightAction,
  showThemeToggle = true,
  showHouseholdSwitcher = true,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background.primary, borderBottomColor: theme.border.default },
        style,
      ]}
      testID={testID}
    >
      {/* Left: Back Button or Spacer */}
      <View style={styles.leftSection}>
        {showBack ? (
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            testID={`${testID}-back-button`}
          >
            <IconSymbol
              name="chevron.left"
              size={24}
              color={theme.interactive.primary}
            />
            <Text style={[styles.backText, { color: theme.interactive.primary }]}>
              Back
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.leftSpacer} />
        )}
      </View>

      {/* Center: Title */}
      <View style={styles.centerSection}>
        <Text
          style={[styles.title, { color: theme.text.primary }]}
          numberOfLines={1}
          testID={`${testID}-title`}
        >
          {title}
        </Text>
      </View>

      {/* Right: Household Switcher + Theme Toggle + Action or Spacer */}
      <View style={styles.rightSection}>
        <View style={styles.rightActions}>
          {showHouseholdSwitcher && (
            <HouseholdSwitcherButton
              size={20}
              testID={`${testID}-household-switcher`}
            />
          )}
          {showHouseholdSwitcher && showThemeToggle && (
            <View style={styles.rightActionSpacer} />
          )}
          {showThemeToggle && (
            <ThemeToggleButton
              size={20}
              testID={`${testID}-theme-toggle`}
            />
          )}
          {rightAction && (
            <View style={(showThemeToggle || showHouseholdSwitcher) ? styles.rightActionSpacer : undefined}>
              {rightAction}
            </View>
          )}
          {!rightAction && !showThemeToggle && !showHouseholdSwitcher && <View style={styles.rightSpacer} />}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60, // Account for status bar
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightActionSpacer: {
    marginLeft: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  leftSpacer: {
    width: 60,
  },
  rightSpacer: {
    width: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

