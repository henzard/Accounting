// BabyStepsDisplay Component - Homebase Budget
// Shows current Baby Step with progress indicator

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/infrastructure/theme';
import { BABY_STEPS, getBabyStep } from '@/shared/constants/baby-steps';
import { formatCurrency, CurrencyCode, convertFromUSD } from '@/shared/utils/currency';
import { Card } from './Card';
import { AppText } from './styled/app-text';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';

interface BabyStepsDisplayProps {
  currentStep: number;
  currency?: CurrencyCode;
  onPress?: () => void;
  testID?: string;
}

export const BabyStepsDisplay: React.FC<BabyStepsDisplayProps> = ({
  currentStep,
  currency = 'USD',
  onPress,
  testID,
}) => {
  const { theme } = useTheme();
  const step = getBabyStep(currentStep);

  if (!step) {
    return null;
  }

  const content = (
    <Card testID={testID}>
      {/* Header with Step Number and Title */}
      <View style={styles.header}>
        <View
          style={[
            styles.stepBadge,
            { backgroundColor: theme.interactive.primary },
          ]}
        >
          <AppText variant="h2" style={[styles.stepNumber, { color: theme.text.inverse }]}>
            {step.step}
          </AppText>
        </View>
        <View style={styles.titleContainer}>
          <AppText variant="caption" style={[styles.stepLabel, { color: theme.text.secondary }]}>
            Baby Step {step.step} of 7
          </AppText>
          <AppText variant="bodyEmphasis" style={[styles.stepTitle, { color: theme.text.primary }]}>
            {step.shortTitle}
          </AppText>
        </View>
        <AppText variant="display" style={styles.icon}>
          {step.icon}
        </AppText>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: theme.background.tertiary },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: theme.status.success,
                width: `${((currentStep - 1) / 6) * 100}%`,
              },
            ]}
          />
          <View
            style={[
              styles.progressCurrent,
              {
                backgroundColor: theme.interactive.primary,
                left: `${((currentStep - 1) / 6) * 100}%`,
              },
            ]}
          />
        </View>

        {/* Step Dots */}
        <View style={styles.dotsContainer}>
          {BABY_STEPS.map((s) => (
            <View
              key={s.step}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    s.step < currentStep
                      ? theme.status.success
                      : s.step === currentStep
                      ? theme.interactive.primary
                      : theme.background.tertiary,
                  borderColor:
                    s.step === currentStep
                      ? theme.interactive.primary
                      : 'transparent',
                  borderWidth: s.step === currentStep ? 2 : 0,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Description */}
      <AppText variant="body" style={[styles.description, { color: theme.text.secondary }]}>
        {step.description}
      </AppText>

      {/* Goal if available */}
      {step.goalAmountUSD && (
        <View
          style={[
            styles.goalContainer,
            { backgroundColor: theme.status.successBackground },
          ]}
        >
          <AppText variant="bodyEmphasis" style={[styles.goalLabel, { color: theme.status.success }]}>
            Goal: {formatCurrency(convertFromUSD(step.goalAmountUSD, currency), currency)}
          </AppText>
        </View>
      )}

      {/* Tap hint */}
      {onPress && (
        <AppText variant="caption" style={[styles.tapHint, { color: theme.text.tertiary }]}>
          Tap to change step →
        </AppText>
      )}
    </Card>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  stepBadge: {
    width: SPACING[12],
    height: SPACING[12],
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  stepNumber: {},
  titleContainer: {
    flex: 1,
  },
  stepLabel: {
    marginBottom: SPACING[1],
  },
  stepTitle: {},
  icon: {
    marginLeft: SPACING[2],
  },
  progressContainer: {
    marginBottom: SPACING[4],
  },
  progressTrack: {
    height: SPACING[2],
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'visible',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.sm,
  },
  progressCurrent: {
    position: 'absolute',
    top: -SPACING[1],
    width: SPACING[4],
    height: SPACING[4],
    borderRadius: BORDER_RADIUS.full,
    marginLeft: -SPACING[2],
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING[2],
    paddingHorizontal: SPACING[1],
  },
  dot: {
    width: SPACING[3],
    height: SPACING[3],
    borderRadius: BORDER_RADIUS.full,
  },
  description: {
    marginBottom: SPACING[3],
  },
  goalContainer: {
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING[2],
  },
  goalLabel: {},
  tapHint: {
    textAlign: 'right',
    marginTop: SPACING[1],
  },
});

