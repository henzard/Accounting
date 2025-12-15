// ScreenHeader Component - Homebase Budget
// Reusable header for all screens with consistent back button and styling

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  showBack = true,
  onBackPress,
  rightAction,
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

      {/* Right: Action or Spacer */}
      <View style={styles.rightSection}>
        {rightAction || <View style={styles.rightSpacer} />}
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

